<#assign content>



<h1>Welcome to the NCF contract form</h1>
<p> To save your completed contract press submit. To save for later, press save. </p>


<!--<p> take this section and change it to submit or save.</p> -->

<form id="submit" action="/contract/saved" method="post">

<input type="hidden" name="id_token" id="google_id_token" value="ANON">

<input type='submit'>Go!<br/> <br/>
    Semester
    <select name='Semester'> 
        <option value='Spring'>Spring</option>
        <option value='Fall'>Fall</option>
    </select>  <br/>   
    
    Year
    <select name="year">
        <option value='2016'>2016</option>
        <option value='2017'>2017</option>
        <option value='2018'>2018</option>
        <option value='2019'>2019</option>
        <option value='2020'>2020</option>
        </select> <br/>
        
    Location
    <select name='location'> 
        <option value='On campus'>On campus</option>
        <option value='Off campus'>Off campus</option>
    </select>           
    

<br>                     
<textarea id="newFirstName" name="newFirstName" placeholder=""></textarea> First Name <br>
<textarea id="newLastName" name="newLastName" placeholder=""></textarea> Last Name <br>
<textarea id="n_number" name="n_number" placeholder=""></textarea> N number <br>
<textarea id="box number" name="box number" placeholder=""></textarea> Box Number <br>

<textarea id="goals" name="goals" placeholder=""></textarea> Goals<br> 



<!-- where the course material lies-->


<#include "coursesTable.ftl">







<br>



<textarea id="cert" name="cert" placeholder=""></textarea> Certification Criteria<br>
<textarea id="other" name="other" placeholder=""></textarea> Descriptions and other activities <br>
Advisor <br>
<textarea id="advisor name" name="advisor name" placeholder=""></textarea> name 



<br>

</form>            

</#assign>
<#include "main.ftl">
