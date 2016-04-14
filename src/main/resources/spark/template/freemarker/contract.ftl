<#assign content>

<h1>Welcome to the NCF contract form</h1>
<p> To save your completed contract press submit. To save for later, press save. </p>


<!--<p> take this section and change it to submit or save.</p> -->

<form id="submit" action="/play" method="post">
<input type='submit'>Go!<br/> <br/>

    Semester <select name='Semester'> 
        <option value='Spring'>Spring</option>
        <option value='Fall'>Fall</option>
    </select>  </br>         
    Year <select name="year">
        <option value='2016'>2016</option>
        <option value='2017'>2017</option>
        <option value='2018'>2018</option>
        <option value='2019'>2019</option>
        <option value='2020'>2020</option>
        </select> </br>
    Location <select name='location'> 
        <option value='On campus'>On campus</option>
        <option value='Off campus'>Off campus</option>
    </select>           
    

<br>                     
<textarea id="newFirstName" name="newFirstName" placeholder=""></textarea> First Name <br>
<textarea id="newLastName" name="newLastName" placeholder=""></textarea> Last Name <br>
<textarea id="n_number" name="n_number" placeholder=""></textarea> N number <br>
<textarea id="newPassword" name="newPassword" placeholder=""></textarea> Password <br>
<br>


    <!--Score information-->
  <input type="hidden" id="currentTotalScore" name="currentTotalScore">
  <input type="hidden" id="averageScore" name="averageScore">
  <input type="hidden" id="maxScore" name="maxScore">
  <input type="hidden" id="numberOfGames" name="numberOfGames">
  <input type="hidden" id="percentScore" name="percentScore">
</form>            
 


<button id='login' onclick="login()">
        login
</button>

<button id="create"
onclick="createUser()">
<!--   ${newUsername},${newPassword}, ${newFirstName}, 
${newLastName}}-->
        create user
</button>



<script>updateScores(${currentTotalScore}, ${averageScore},
            ${maxScore}, ${numberOfGames},${percentScore});</script>

</#assign>
<#include "main.ftl">
