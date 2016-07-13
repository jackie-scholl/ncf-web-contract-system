# ncf-web-contract-system

## Work in Progress

This project is not ready for production use yet. There's still a massive amount of stuff to do. There is basically no testing, and this README is the only real documentation, and it's super informal. Let this be only a rough guide to where I am and where I'm aiming for. None of this is set in stone.

## New College of Florida

This project is intended for eventual use by [New College of Florida](https://www.ncf.edu), but it is not ready for their use yet, they have in no way approved or agreed to this project, and it's not even really ready for them to know about yet.

## Building

We use Maven for building/testing/running Java, npm for javascript package management, and Gulp for building the rest (JS, HTML, CSS) and running everything. You'll need to make sure you have Git, NodeJS, npm, and Maven installed. With apt, this looks like `sudo apt-get install -y git nodejs npm maven`. Then on any system, just run these commands to set up a dev environment:

```
clone https://github.com/raptortech-js/ncf-web-contract-system.git
&& cd contract-form
&& npm install
&& node node_modules/gulp/bin/gulp.js
```

Note that this will start a local webserver running on port 4232, and also will start Grunt watching your files, looking for changes and updating the output resources real-time. If you just want to build everything, run `node node_modules/gulp/bin/gulp.js single`.

## Testing

Just run

```
mocha src/test/js/*
```

## Background

The super-high-level overview is that we're replacing an existing paper form based process with a web app.

The paper form represents what we call a "contract," which is *not legally binding* but represents a shared idea between a student, their advisor, and the school about what they are expected to complete in a given term. Mostly, it's just what classes you're taking and how many of them you need to take to "sat" the contract, which has implications for financial aid and staying at the school and such. This project includes a [blank contract form](src/main/resources/Contract.pdf) and a generically filled contract form (to be uploaded).

## Timeline

- Minimum Viable Product: Late April 2016 (done)
- Presentable, somewhat refined MVP: Mid-May 2016 (done)
- Closed Beta: Late July/Early August 2016 (not sure if this phase even makes sense?)
- Open Beta: Late August/Early September 2016
- Presentation to Administration: September 2016
- Integration with school systems: October 2016-January 2017
- First run as an official school system: February 2017

## Current Status

I haven't actually met with the administration yet to talk about this, but I've heard that they are interested in having a web contract system and I've been working with my advisor on refining it the idea. Basically, we think it's best to wait until we have a relatively good-looking, functioning prototype before I take it to them and get their feedback. We were actually thinking of running a beta test with students in the Fall where the system doesn't integrate with any of the school systems, just to show that it works relatively well and is useful and it makes sense to go ahead and integrate with the school.

So basically the way I have it set up right now, when a user visits the site they're asked to log in with their school Google login, and once they do they see a list of contract forms they've started on the left, and the most recent once they've worked on pops up in the center. Right now, it basically just mimics the fields in the PDF. As they edit the form, the data is saved (to the  local cache) and they can see a live preview of the filled PDF. This just uses an <object> tag to embed the PDF, so the user can use the browser's interface to zoom in/out, save or print the PDF, and so on. There's no way for the student or the advisor to sign the form.

Basically, what I've built is a web form that allows you to enter the same stuff you could on the PDF anyways, but it saves the data as you type and you can go back and look at old contracts.

## Hosting Plans

I'm planning on using AWS for everything and running a "serverless" configuration. In particular, I'm hoping to use [Aerobatic](https://www.aerobatic.com) for static hosting, API Gateway and Lambda to handle requests from the client (PDF generation and syncing), and most likely S3 for storage. It's important to me that the hosting be "serverless" because once the project is out of my hands, I cannot guarantee that the school will perform regular maintenance and patching, so as much of that as possible should be handled for us by AWS. I also want to keep costs very low (hopefully under $20/year), so having an EC2 instance (or especially multiple instances) running around the clock is not really an option. It is also important that the system should seamlessly scale from having no users for months on end to suddenly having up to 1500 active simultaneous users (the school currently has ~850 students, but I'm planning for expansion). Additionally, we can leverage AWS's security to limit the amount of work we have to do.

## Overall Goals

- **Ease of use**
  - Aesthetically pleasing
  - Mobile friendly
- **Accessibility**
  - Support users with disabilities
- **Availability**
  - The system needs to remain available, even during high use
- **Durability of data**
  - Resistant to closing the browser tab, sudden internet or power loss
  - Replication across availability zones
  - Backups resistant to malicious tampering by targeted adversary
- **Security**
  - Users should not be able to view/edit either other's data
  - To prevent harassment and abuse, users should not be able to interact at all (unless necessary)
  - Ideally, user data should be encrypted and not available to system administrators or the government (I haven't found a way to do this that doesn rely on PINs or passwords)
- **Maintainability**
  - System is unlikely to be actively maintained over its entire lifetime
  - Therefore, system should be able to live on with very little or no maintenance
  - System should degrade gracefully, allowing some features to fail while the system keeps on working
  - Depended-upon systems should have a history of supporting legacy projects
  - Project should be thoroughly documented so maintaining is as easy as possible
  - Build/test system should be entirely automated


## Backends

#### SQLite3

The first backend we wrote, back when we were using Freemarker templates with no client-side scripting, was based on SQLite3.

#### DynamoDB

We built another backend with the same interface as the SQLite3 one using DynamoDB, and maintained them seperately. We eventually realized, however, that the system would be too complicated, with 5 separate Lambda functions to read/write the database, each one with its own API Gateway resource and specific calls in the client-side code, and we would have to have a system to automatically scale the DB for read/write capacity, and it could easily have gotten expensive.

#### Cognito Sync

I decided to switch to using Cognito Sync, because that offered to manage the database for us and handle all of the syncing  for us, and we could just use it as the datastore on the client and call the sync operation when necessary. It turns out, however, that Cognito Sync has two major flaws:

- It's a bit expensive: $0.15 per 10,000 sync operations means I could only afford to allow each client to sync about 450 times
- It allows anyone: Previously, I limited the system to only users with ncf.edu Google accounts to significantly cut down on the amount of abuse possible. With Cognito Federated Identities, I only have the option to allow login with Google, or not allow login with Google. This means anyone with a Google account could potentially run sync operations against my datastore
- Clients decide when to sync: Anyone could use my Cognito Identity Pool with any Google account and run sync operations against the project's account, costing it money each time and eventually draining the budget

#### S3

To address these challenges, I intend to write my own backend for Cognito Sync, using the same [Cognito Sync for the Web](https://github.com/aws/amazon-cognito-js) client-side code, but using my own backend (this may require forking the project). I will store all the data in S3 and write a custom sync handler that runs on Lambda and can be called through API Gateway. The sync handler will have its own code to smartly merge changes, and will take a Google login token to verify that a given user is an ncf.edu user and I may implement a blacklist for users who abuse the system. Hosting on Lambda and API Gateway, I hope to stay under the 1 million call/month perpetual free teir, so I'll only be paying for S3.



## More info
##### Sorry for the info dump, I'll try to organize it later, but for now here's an email I sent to a friend about the project:

I'm also going to have a Lambda function behind API Gateway that does the job of turning a JSON object representing a contract into a filled PDF. I haven't found a javascript library that allows you to actually edit PDFs like that, so I wrote that component in Java with Apache's PDFBox library. The benefit of a Lambda function is that it's incredibly cheap and scales really well, so my clients can request an updated PDF every time the user makes a single-character change.

The front-end is a React app that handles the bulk of stuff. It uses controlled fields so when a user makes a change in one of the fields it propagates up the chain to the root React node, which updates the local storage and then calls a function that updates the state of the React component from the local storage, causing React to re-render the whole thing. I was surprised at how smooth this actually is.
One of my concerns is that I have basically all of my front-end logic in a single 700-line javascript file that does everything from rendering a text input field to setting up that Cognito library to figuring out how to turn a Date object into something like "5 hours ago." I'm pretty sure I should be able to use node modules or something to handle this, but I'm not sure how.

In the future, I'd like to connect to a database of classes so that users don't have to enter the class number and name and teacher name for every single class. I'd also like to have a way for the student and advisor to "sign" or agree to a contract, but most of the ways I can think of doing that require the school to trust my application for correctness, and I'm not sure they'd be willing to do that. It's still not clear to what degree this app will end up being an official school system, owned, run, and managed by the school, versus a totally independent project that students can use to create contracts more easily.
