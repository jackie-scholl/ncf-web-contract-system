
<#assign heading>
   <form align="center">
     <h1>Welcome to the NCF contract page</h1>
     <p> To save, submit or view old contracts, please sign in. </p>
     <p> To save your completed contract press submit. To save for later, press save. </p>
   </form>
</#assign>

<#assign content>

<script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react-dom.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.6.16/browser.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.5/marked.min.js"></script>

<div id="content"></div>
<div id="contract-id" style="display: none;">${id}</div>

<script type="text/babel" src="/js/contract_react.js"></script>


<!--
<a href="/contracts/${id}/pdf">View PDF</a>
<form id="submit" class="blank-form" action="/contracts/${id}/save" method="post">

<input type="hidden" name="id_token" id="google_id_token" value="ANON">

<input type='submit'>Go!<br/> <br/>
    Semester
    <select name='Semester'> 
        <option value='Spring'>Spring</option>
        <option value='Fall'>Fall</option>
    </select>  <br/>   
    
    Year
    <select name="year">
        <#list 2012..2020 as year>
        	<option value='${year?c}'>${year?c}</option>
        </#list>
    </select> <br/>
        
    Location
    <select name='location'> 
        <option value='On Campus'>On Campus</option>
        <option value='Off Campus'>Off Campus</option>
    </select>           
    

<br>                     
<textarea id="firstName" name="firstName" placeholder=""></textarea> First Name <br>
<textarea id="lastName" name="lastName" placeholder=""></textarea> Last Name <br>
<textarea id="n_number" name="n_number" placeholder=""></textarea> N number <br>
<textarea id="expected_grad_year" name="expected_grad_year" placeholder=""></textarea> Expected Year of Graduation <br />
<textarea id="box number" name="box number" placeholder=""></textarea> Box Number <br>

<textarea id="goals" name="goals" placeholder=""></textarea> Goals<br> 

<#include "coursesTable.ftl">


<br>
<textarea id="cert" name="cert" placeholder=""></textarea> Certification Criteria<br>
<textarea id="other" name="other" placeholder=""></textarea> Descriptions and other activities <br>
<textarea id="advisor name" name="advisor name" placeholder=""></textarea> Advisor name <br>

</form>
-->

</#assign>

<#include "main.ftl">