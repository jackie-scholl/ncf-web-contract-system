<#assign content>

<#include "board.ftl">

<!--this creates a space for the timer.-->
<#include "timer.ftl">

<p> Welcome to boggle - ${username}</p>
<form id="myForm" method="POST" action="/results">
    <textarea id="id_guesses" name="guesses" placeholder="Enter words here"></textarea>
    <input type="submit">
    <input type="hidden" name="board" value="${board.toString(',')}">

    <!--Add the timer -->
    <script>CreateTimer("timer", ${time});</script>

    <!--Score information-->
    <input type="hidden" id="currentTotalScore" name="currentTotalScore">
    <input type="hidden" id="averageScore" name="averageScore">
    <input type="hidden" id="maxScore" name="maxScore">
    <input type="hidden" id="numberOfGames" name="numberOfGames">
    <input type="hidden" id="percentScore" name="percentScore">
    <input type="hidden" id="timeChosen" name="timeChosen" value="${time}">
    <input type="hidden" id="username" name="username" value="${username}">

</form>




<div class='dropdown'>

    <button id='optionButton' onclick="toggleDropdownContent();">
        Show Options
    </button>

    <div id='dropdownOptions' class="dropdown-content" style="display:none;">
        
        <button id='instructionButton'
                onclick="toggleInstructions()">
            Show Instructions
        </button>

        <input type="color" id="selectedColor"/>


        <button id="boardBackgroundColorChangeButton"
                onclick="changeColorOfBoardBackground()">
            Change Color of Board Background
        </button>

        <button id="toggleBoardBorderButton"
                onclick="toggleBoardBorder()">
            Toggle Board Boarder
        </button>

        <button id="toggleCharBorderButton"
                onclick="toggleCharBorder()">
            Toggle Character Border
        </button>

        <button id="toggleCharFontButton"
                onclick="toggleCharFont()">
            Toggle Character Font
        </button>

    </div>

</div>


<input type="hidden" id="fontNumber" name="fontNumber" value="0">

<p id='instructionParagraph'></p>

<script>
    updateScores(${currentTotalScore}, ${averageScore},
            ${maxScore}, ${numberOfGames}, ${percentScore});
</script>



</#assign>
<#include "main.ftl">
