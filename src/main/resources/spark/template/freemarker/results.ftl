<#assign content>

<#include "board.ftl">
<p>
  ${username} - Your score was ${score}.
</p>

<#if 0 < good?size >
You scored with these:
<ul>
<#list good as word>
   <li>${word}
</#list>
</ul>
</#if>

<#if 0 < bad?size >
These words didn't score
<ul>
<#list bad as word>
   <li>${word}
</#list>
</ul>
</#if>

<#if 0 < missed?size >
You missed these
<ul>
<#list missed as word>
   <li>${word}
</#list>
</ul>
</#if>

<form method='post' action='/play'>
    <!--Score information-->
    <input type="hidden" id="currentTotalScore" name="currentTotalScore">
    <input type="hidden" id="averageScore"      name="averageScore">
    <input type="hidden" id="maxScore"          name="maxScore">
    <input type="hidden" id="numberOfGames"     name="numberOfGames">
    <input type="hidden" id="percentScore"      name="percentScore">
    <input type="hidden" id="timeChosen"        name="timeChosen" value="${time}">
    <input type="hidden" id="newUsername"       name="newUsername"   value="${username}">
    <input type='submit' value="Play again?">
</form>

<!--Player's score information-->
<p id='printCurrentTotalScore'></p>
<p id='printPercentScore'></p>
<p id='printAverageScore'></p>
<p id='printMaxScore'></p>
<p id='printNumberOfGames'></p>

<!--Player's score information
<p id='printCurrentTotalScore'>Your total score is: ${currentTotalScore}</p>
<p id='printAverageScore'>Your average score per board is: ${averageScore}</p>

<p id='printMaxScore'>Your max score this run is: ${maxScore}</p>
<p id='printNumberOfGames'>Your total number of games this run is: ${numberOfGames}</p>
-->

<script>
    updateScores(${currentTotalScore}, ${averageScore},
            ${maxScore}, ${numberOfGames});
    printScores(${currentTotalScore}, ${averageScore},
            ${maxScore}, ${numberOfGames},${percentScore});
</script>

</#assign>
<#include "main.ftl">

