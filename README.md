# ncf-web-contract-system

## Work in Progress

This project is not ready for production use yet. There's still a massive amount of stuff to do.

## Building

We use Maven for building/testing/running Java, npm for javascript package management, and Gulp for building the rest (JS, HTML, CSS) and running everything. You'll need to make sure you have Git, NodeJS, npm, and Maven installed. With apt, this looks like `sudo apt-get install -y git nodejs npm maven`. Then on any system, just run these commands to set up a dev environment:

```
clone https://github.com/raptortech-js/ncf-web-contract-system.git
&& cd contract-form
&& npm install
&& node node_modules/gulp/bin/gulp.js
```

Note that this will start a local webserver running on port 4232, and also will start Grunt watching your files, looking for changes and updating the output resources real-time. If you just want to build everything, run `node node_modules/gulp/bin/gulp.js single`.

## More info
##### Sorry for the info dump, I'll try to organize it later, but for now here's an email I sent to a friend about the project:

So I'm working on this web app for my school. The super-high-level overview is that we're replacing an existing paper form based process with a web one.

The paper form represents what we call a "contract," which is not legally binding or anything but represents a shared idea between a student, their advisor, and the school about what they are expected to complete in a given term. Mostly, it's just what classes you're taking and how many of them you need to take to "sat" the contract, which has implications for financial aid and staying at the school and such. Anyways, I've attached the fillable contract PDF form and a generic filled form in case you wanna take a look.

I haven't actually met with the administration yet to talk about this, but I've heard that they are interested in having a web contract system and I've been working with my advisor on refining it the idea. Basically, we think it's best to wait until we have a relatively good-looking, functioning prototype before I take it to them and get their feedback. We were actually thinking of running a beta test with students in the Fall where the system doesn't integrate with any of the school systems, just to show that it works relatively well and is useful and it makes sense to go ahead and integrate with the school.

So basically the way I have it set up right now, when a user visits the site they're asked to log in with their school Google login, and once they do they see a list of contract forms they've started on the left, and the most recent once they've worked on pops up in the center. Right now, it basically just mimics the fields in the PDF. As they edit the form, the data is saved (to the  local cache) and they can see a live preview of the filled PDF. This just uses an <object> tag to embed the PDF, so the user can use the browser's interface to zoom in/out, save or print the PDF, and so on. There's no way for the student or the advisor to sign the form.

Basically, what I've built is a web form that allows you to enter the same stuff you could on the PDF anyways, but it saves the data as you type and you can go back and look at old contracts.

Right now, I'm planning on hosting the whole system on AWS because that's what I'm used to. I'm also trying to keep costs to a bare minimum, which means using available AWS systems and not just running the whole thing on an EC2 instance. This should also help reduce attack surface and lower maintenance. My hope is that I can run this in a "serverless" configuration.

I built a whole DynamoDB backend with an API so that the client could load and save contracts, but I realized that doesn't scale to the degree I wanted - DynamoDB free tier only offers ~25 reads/writes per second, and I would like clients to be able to save automatically as the user types and there's 800 students at the school, so I just don't think the whole thing is scalable enough, so for now I'm scrapping the DynamoDB thing and using local storage. Obviously, in the future, the data should be stored remotely so it can follow you between devices. I'm thinking I might adapt AWS's Cognito client for Javascript to intelligently sync with an AWS Lambda function that stores data in S3. I'm currently actually using that Cognito client as just an interface to local storage.

I'm also going to have a Lambda function behind API Gateway that does the job of turning a JSON object representing a contract into a filled PDF. I haven't found a javascript library that allows you to actually edit PDFs like that, so I wrote that component in Java with Apache's PDFBox library. The benefit of a Lambda function is that it's incredibly cheap and scales really well, so my clients can request an updated PDF every time the user makes a single-character change.

The front-end is a React app that handles the bulk of stuff. It uses controlled fields so when a user makes a change in one of the fields it propagates up the chain to the root React node, which updates the local storage and then calls a function that updates the state of the React component from the local storage, causing React to re-render the whole thing. I was surprised at how smooth this actually is.
One of my concerns is that I have basically all of my front-end logic in a single 700-line javascript file that does everything from rendering a text input field to setting up that Cognito library to figuring out how to turn a Date object into something like "5 hours ago." I'm pretty sure I should be able to use node modules or something to handle this, but I'm not sure how.

In the future, I'd like to connect to a database of classes so that users don't have to enter the class number and name and teacher name for every single class. I'd also like to have a way for the student and advisor to "sign" or agree to a contract, but most of the ways I can think of doing that require the school to trust my application for correctness, and I'm not sure they'd be willing to do that. It's still not clear to what degree this app will end up being an official school system, owned, run, and managed by the school, versus a totally independent project that students can use to create contracts more easily.

I'd also like to make sure that the site is aesthetically pleasing, mobile-friendly, and accessible to all. Of course, security is critical. 
