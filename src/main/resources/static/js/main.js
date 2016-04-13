function changeColorOfBoardBackground() {
    var color = ID("selectedColor").value;
    var tableBoard = classElems("board")[0];
    tableBoard.style.background = color;
}

function toggleBoardBorder() {
    var tableBoard = ID("board");
    if (tableBoard.style.border == '') {
        tableBoard.style.border = '5px solid black';
    } else {
        tableBoard.style.border = '';
    }
}

function toggleCharBorder() {
    var tableData = document.getElementsByTagName('td');
    var i;
    for (i = 0; i < tableData.length; i++) {
        if (tableData[i].style.border == '') {
            tableData[i].style.border = '2px solid black';
        } else {
            tableData[i].style.border = '';
        }
    }
}

function toggleCharFont() {
    var tableData = classElems("board")[0];
    var fontNumber = ID('fontNumber').value;
    switch (fontNumber) {
        case '0':
            tableData.style.fontFamily = 'Oleo Script';
            ID('fontNumber').value = 1;
            break;
        case '1':
            tableData.style.fontFamily = 'Lobster Two';
            ID('fontNumber').value = 2;
            break;
        case '2':
            tableData.style.fontFamily = 'Just Another Hand';
            ID('fontNumber').value = 3;
            break;
        case '3':
            tableData.style.fontFamily = 'Verdana';
            ID('fontNumber').value = 0;
            break;
    }
}

function login(newUsername, newPassword, newFirstName, newLastName, usernamesTaken){
    alert("testing the create user");
    var temp = 2
    if (1 === temp){
                               
                               alert("welcome back");
                               ID("welcomeForm").submit();
    } else {
        alert("this username is taken");
        ID("welcomeForm").submit();
    }

}


function createUser(newUsername, newPassword, newFirstName, newLastName, usernamesTaken) {
    alert("further along");
    //!usernamesTaken.contains(newUsername)
    var temp = 2 
        if (1 === temp){
                               DatabaseManager.insertNewAccount(newUsername, newPassword,
                               newFirstName, newLastName);
                               alert("welcome");
                               document.getElementById("welcomeForm").submit();
    } 
    
    else {
        alert("this username is taken");
        document.getElementById("welcomeForm").submit();
    }

}





function updateScores(currentTotalScore, averageScore, maxScore, numberOfGames, percentScore ) {
    ID('currentTotalScore').value = currentTotalScore;
    ID('percentScore').value = percentScore;
    ID('averageScore').value = averageScore;
    ID('maxScore').value = maxScore;
    ID('numberOfGames').value = numberOfGames;
}

function printScores(currentTotalScore, averageScore, maxScore, numberOfGames, percentScore ) {
    ID('printCurrentTotalScore').innerHTML =
            'Your total score is: ' + currentTotalScore;
    ID('printPercentScore').innerHTML =
            'Your percentage of the total possible score is: ' + percentScore;
    ID('printAverageScore').innerHTML =
            'Your average score per board is: ' + averageScore;
    ID('printMaxScore').innerHTML =
            'Your current max score is: ' + maxScore;
    ID('printNumberOfGames').innerHTML =
            'Your current number of games is: ' + numberOfGames;
}

function ID(idName) {
    return document.getElementById(idName);
}

function classElems(className) {
    return document.getElementsByClassName(className);
}

function toggleInstructions() {
    if (ID('instructionParagraph').innerHTML == '') {
        ID('instructionParagraph').innerHTML = "Make as many words as you can\n\
            by starting from one letter and branching out to the surrounding\n\
            letters. Only words that are >2 letters long count towards your\n\
            final score.";
    } else if (ID('instructionParagraph').innerHTML != '') {
        ID('instructionParagraph').innerHTML = '';
    }
}

function toggleDropdownContent() {
    if (ID("dropdownOptions").style.display == "block" ) {
        ID("dropdownOptions").style = "display: none;";
    } else {
        ID("dropdownOptions").style = "display: block;";
    }
}









var Timer;
var TotalSeconds;
var sound = new Audio("https://upload.wikimedia.org/wikipedia/commons/5/56/Clock_ticking.ogg");
function CreateTimer(TimerID, Time) {
    Timer = document.getElementById(TimerID);
    TotalSeconds = Time;
    UpdateTimer();
    window.setInterval("Tick()", 1000);
}


function Tick() {
    TotalSeconds -= 1;
    if (TotalSeconds < 0) {
        document.getElementById("myForm").submit();
        alert("Times up.");
    } else {
        sound.play();
        UpdateTimer();
    }
    //window.setTimeout("Tick()", 1000);
    /*ID('TotalTime').innerHTML =
            'Your remaining time is: ' + TotalSeconds;
            */
}

function UpdateTimer() {
    Timer.innerHTML = "Your remaining time is " + TotalSeconds;
}