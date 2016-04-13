<#assign content>

<h1>Welcome to Boggle, by Team DDT!</h1>
<p>In this game, players have a set amount of time 
(chosen below) <br>to find as many words as they can in the grid, 
according to the following rules:<br>
- The letters must be adjoining in a 'chain'. <br>
- Words must contain at least three letters.<br>
- No letter cube may be used more than once within a single word. </p>

<form id="welcomeForm" action="/play" method="post">
    <select name='timeChosen'>
        <option value='30'>30 sec</option>
        <option value='60'>60 sec</option>
        <option value='120'>120 sec</option>
        <option value='180'>180 sec</option>
    </select>
    <input type='submit'>Go!<br/>

<br>                     
<textarea id="newFirstName" name="newFirstName" placeholder=""></textarea> First Name <br>
<textarea id="newLastName" name="newLastName" placeholder=""></textarea> Last Name <br>
<textarea id="newUsername" name="newUsername" placeholder=""></textarea> Username <br>
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
${newLastName},${usernamesTaken}-->
        create user
</button>



<script>updateScores(${currentTotalScore}, ${averageScore},
            ${maxScore}, ${numberOfGames},${percentScore});</script>

</#assign>
<#include "main.ftl">
