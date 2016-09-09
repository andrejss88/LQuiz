// New QUIZ
(function($) {

  $(document).ready(function() {

    /********** Quiz settings **********/
    var compareWithLastScore = true; // switch true/false for cookie score compare
    var secPerEasyExercise = 45; // seconds allocated per exercise if "easier" is chosen; change at will
    var secPerDiffExercise = 30; // seconds allocated per exercise if "harder" is chosen; change at will
    var showTimerOption = true; // false = do not show "Against time"
    var evaluateEntireQuiz = true; // true = one evaluation btn at the bottom; false = each exercise evaluated individually

    /********** Global variables **********/
    var hintsLeft; //   defined by quizDifficulty
    var progressBar = '<div class="progress"> <div aria-valuemax="100" aria-valuemin="0" aria-valuenow="10" class="progress-bar progress-bar-striped" role="progressbar"></div></div>';
    var textQuestions = $('.FillIn input[type=text]');
    var quizContainer = '#quizContainer';
    var correctMultiChoiceAnswer = '.multiForm input:radio[data-correctanswer]';



    /********** Set up the Quiz **********/
    hideQuizContainer();
    loadQuizHelp();

    /********** Buttons functionality **********/
    $('#startQuiz').on('click', function() {
      $('.specialCharWrap').toggleClass('hidden'); // display generated buttons of special chars
      $(this).addClass('hidden');
      $('#QuizDiff, #QuizExplanation').addClass('hidden');

      setQuizDifficulty();
      setTimer();
      $(quizContainer).slideDown();
    });

    // resets all elements visibility to initial state
    $('#restartQuiz').on('click', function() {
      $('.specialCharWrap').toggleClass('hidden');
      $(quizContainer).slideUp();
      $('#startQuiz, #QuizDiff').removeClass("hidden");
      $('#showCorrectAnswersAll').css('display', 'none');

      if (!evaluateEntireQuiz) {
        $('.showCorrectAnswers, .clearAnswers').css('display', 'none');
      }

      if (gotIt == null) {
        $('#QuizExplanation').removeClass("hidden");
      }
      $('.hintBtn').css({
        "background": "#98D349",
        "border-color": "#98D349"
      });
      $(".clearAnswers").click();
      $('.timerWrap').remove();

      var feedbackField = getExerciseContainer($(this)).find('.exerEvaluation');
      feedbackField.clearIt();
    });


    $('#checkExam').click(function() {
      window.clearTimeout(timer); // reset time

      count = 0;
      examScore = 0;
      var exercise = $('.exerWrap');
      var multiChoiceQuestions = $('.multiForm p');

      var container = getExerciseContainer($(this));
      maxPossibleExamScore = multiChoiceQuestions.length + textQuestions.length;

      checkTextInputAnswers(textQuestions);
      checkMultiChoiceAnswers(exercise);

      showExamResults(container);

      displayCorrectAnswersBtn();
    }); // end of CheckExam

    $(".checkSingleExercise").click(function() {
      exerciseScore = 0;
      count = 0; // reset global var
      var container = getExerciseContainer($(this));
      var correctAnswers = $(textQuestions).data('correctanswer');
      var textQuestions = getTextQuestions(container);

      checkTextInputAnswers(textQuestions);
      checkMultiChoiceAnswers(container);

      showExerciseResult(container);

      // display correct+clear buttons
      $(this).closest('.exerButtons').find('.showCorrectAnswers, .clearAnswers').css('display', 'inline-block');
    });


    $("#showCorrectAnswersAll").click(function() {
      var correctMultiChoiceAnswers = getMultiChoiceCorrectAnswers($(quizContainer));

      showTextAnswers(textQuestions);
      showMultiChoiceAnswers(correctMultiChoiceAnswers);
    });

    // for checking a single exercise
    $(".showCorrectAnswers").click(function() {
      var container = getExerciseContainer($(this));
      var textQuestions = getTextQuestions(container);
      var correctMultiChoiceAnswers = getMultiChoiceCorrectAnswers(container);

      showTextAnswers(textQuestions);
      showMultiChoiceAnswers(correctMultiChoiceAnswers);
    });

    function getMultiChoiceCorrectAnswers(webElement) {
      return webElement.find(correctMultiChoiceAnswer).next('span');
    }

    function getTextQuestions(webElement) {
      return webElement.find(textQuestions);
    }

    function showTextAnswers(textQuestions) {
      $(textQuestions).each(function() {
        $(this).val($(this).data('correctanswer')).makeGreen();
      });
    }

    function showMultiChoiceAnswers(correctMultiChoiceAnswers) {
      $(correctMultiChoiceAnswers).each(function() {
        $(this).closest('li').addClass('correctAnswer checkedAnswer');
        $(this).closest('li').find('input').prop('checked', true);
      });
    }

    $(".clearAnswers").click(function() {
      var container = getExerciseContainer($(this));
      var feedbackField = container.find('.exerEvaluation');
      if (isTextType(container) || container.hasClass('clearFinal')) {
        getTextQuestions(container).val('').makeWhite();
        feedbackField.clearIt();
      } else if (isMultiChoiceType(container)) {
        $('.multiForm li').removeClass();
        $('.multiForm input').prop('checked', false);

        feedbackField.clearIt();
      }
    }); // end of click


    /**********Hint: show one random correct answer **************/
    var hintBtn = $('.hintBtn');

    hintBtn.click(function() {
      var container = getExerciseContainer($(this));

      if (hintsLeft > 0) {
        giveHint();
      } else {
        return false;
      }

      if (hintsLeft === 0) {
        disableHints();
      }

      function giveHint() {
        if (isTextType(container)) {
          hintTextAnswer();
        } else if (isMultiChoiceType(container)) {
          hintMultiChoiceAnswer();
        }
      }

      function hintTextAnswer() {
        var unansweredQuestions = getTextQuestions(container).filter(function() {
          return !this.value;
        });
        var randomInput = Math.floor(Math.random() * unansweredQuestions.length);
        var randomUnansweredQuestion = $(unansweredQuestions).eq(randomInput);

        if (unansweredQuestions.length > 0) {
          updateHintsLeft();
          insertCorrectTextAnswer(randomUnansweredQuestion);
        }
      }

      function hintMultiChoiceAnswer() {
        var correctAnswers = container.find(correctMultiChoiceAnswer).not(':checked');
        if (correctAnswers.length > 0) {
          updateHintsLeft();
          selectCorrectMultiChoiceAnswer(correctAnswers);
        }
      }
    });

    function disableHints() {
      hintBtn.val('No more hints');
      hintBtn.makeGrey();
    }

    /**********Result feedback **************/
    var Afeedback1 = '<p class="quizSummaryText">Excellent!</p>';
    var Afeedback2 = '<p class="quizSummaryText">Brilliant!</p>';
    var Afeedback3 = '<p class="quizSummaryText">Impressive!</p>';
    var Bfeedback1 = '<p class="quizSummaryText">Very good!</p>';
    var Bfeedback2 = '<p class="quizSummaryText">Good work!</p>';
    var Bfeedback3 = '<p class="quizSummaryText">Well done!</p>';
    var Cfeedback1 = '<p class="quizSummaryText">Meh...</p>';

    var perfectScore = [Afeedback1, Afeedback2, Afeedback3];
    var perfectScoreRandom = perfectScore[Math.floor(Math.random() * perfectScore.length)];

    var goodScore = [Bfeedback1, Bfeedback2, Bfeedback3];
    var goodScoreRandom = goodScore[Math.floor(Math.random() * goodScore.length)];

    var lowScore = [Cfeedback1];
    var lowScoreRandom = lowScore[Math.floor(Math.random() * lowScore.length)];

    var buttons = '';

    function createButtons(lettersToMatch) {
      $(textQuestions).each(function() {
        var correctAnswer = $(this).attr('data-correctanswer');
        generateButton(correctAnswer, lettersToMatch);
      });
    }

    function generateButton(correctAnswer, lettersToMatch) {
      for (var i = 0; i < correctAnswer.length; i++) {
        var matchedLetter = correctAnswer[i].match(new RegExp(lettersToMatch));
        if (matchedLetter) {
          buttons += '<button>' + correctAnswer[i] + '</button>';
          lettersToMatch = lettersToMatch.replace(matchedLetter[0], "");
        }
      }
    }

    createButtons("[éèçêïëáíóúüñäöüß]");
    $('.specialCharWrap').append(buttons);

    // Appends special char buttons to text fields
    $(textQuestions).focus(function() {
      var buttons = $(".specialCharWrap");
      $closestInput = $(this);
      $(this).closest('p').after(buttons);
    });

    // Insert button char into field
    $('.specialCharWrap button').click(function() {
      var buttonLetter = $(this).text();
      var input = $closestInput;
      input.val(input.val() + buttonLetter).focus();
      return false;
    });

    /* rest of code
     ***********************************************/
    function getExerciseContainer(webElement) {
      return webElement.closest('.exerWrap');
    }

    function showExerciseResult(container) {
      exerciseScore = exerciseScore + count;
      var resultPercentage;
      var totalInputsCount = getTextQuestions(container).length;
      var feedbackField = container.find('.exerEvaluation');
      var totalMultiChoiceQuestions = container.find('.multiForm p').length;

      if (isTextType(container)) {
        showResult(totalInputsCount);
      } else if (isMultiChoiceType(container)) {
        showResult(totalMultiChoiceQuestions);
      }

      generateResultBar(feedbackField, resultPercentage, container);

      function showResult(questions) {
        resultPercentage = calculateResultPercentage(exerciseScore, questions);
        displayScore(container, exerciseScore, questions);
      }
    }

    function isTextType(container) {
      return container.hasClass('FillinTheBlank') || container.hasClass('RearrangeWords');
    }

    function isMultiChoiceType(container) {
      return container.hasClass('multipleChoiceExercise');
    }


    function displayScore(container, userScore, maxScore) {
      container.find('.exerEvaluation').html(progressBar + '<p class="resultNum">' + userScore + '/' + maxScore + '</p>');
    }

    // lets the user click on text to select the radio btn next to it
    $('.multiForm span').click(function() {
      $(this).closest('li').find('input').click();
    });


    /**********Timer **************/

    var timer;
    var timerContainer = '<div class=" row timerWrap"> <div class="col-sm-8 text-center">  </div> <div class="col-sm-4">  </div>  </div>';
    var numOfExercises = $('.exerWrap').length;

    function setTimer() {
      if ($('#timer').is(':checked')) {
        startTimer();
      }
    }

    function startTimer() {
      clearTimeout(timer);
      $('.exerEvaluationAll').after(timerContainer);
      $(quizContainer).before(timerContainer);
      var quizDifficulty = $('input[name="difficulty"]:checked', '#QuizDiff').attr('id');
      if (document.getElementById("timer").checked) {
        if (quizDifficulty == "easier") {
          sec = (secPerEasyExercise * numOfExercises) % 60;
          min = Math.floor((secPerEasyExercise * numOfExercises) / 60);
        } else {
          sec = (secPerDiffExercise * numOfExercises) % 60;
          min = Math.floor((secPerDiffExercise * numOfExercises) / 60);
        }
      }
      countDown();
    }


    function countDown() {
      sec--;
      if (sec == -1) {
        sec = 59;
        min = min - 1;
      } else {
        min = min;
      }
      if (sec <= 9) {
        sec = "0" + sec;
      }
      time = (min <= 9 ? "0" + min : min) + " m " + sec + " s ";
      $(timerContainer).html(time);
      $('.timerWrap > .text-center').html(time);
      timer = window.setTimeout(countDown, 1000);

      if (min == '00' && sec == '00') {
        sec = "00";
        window.clearTimeout(timer);
        //  alert('time is up');
        showTimeUpAlert();
      }
    }

    function showTimeUpAlert() {
      var overlay = '<div class="overlay-bg"><div class="overlay-content">Time is up!</div>   </div>';
      $(quizContainer).append(overlay);
      $('.overlay-bg').fadeIn("fast").delay(1200).fadeOut("fast");
    }
    /**********Timer End **************/


    function hideQuizContainer() {
      if (!showTimerOption || !evaluateEntireQuiz) {
        $('#timerWrap').addClass('hidden');
      }
      if (evaluateEntireQuiz) {
        $('.checkSingleExercise').addClass('hidden');
      } else {
        $('.checkEntireQuiz').addClass('hidden');
      }
    }

    function setQuizDifficulty() {
      var quizDifficulty = $('input[name="difficulty"]:checked', '#QuizDiff').attr('id');
      if (quizDifficulty == "easier") {
        hintsLeft = 3;
      } else {
        hintsLeft = 1;
      }
      hintBtn.val('Hint (' + hintsLeft + ' left)');
    }

    function loadQuizHelp() {
      gotIt = getCookie("gotIt");
      if (gotIt !== null) {
        $('#QuizExplanation').addClass('hidden');
      }
    }

    $('#gotit').click(function() {
      setCookie("gotIt", 'True', 30);
      $('#QuizExplanation').addClass('hidden');
    });


    function setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toGMTString();
      document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return null;
    }

    function displayScoreCompareMsg(result, feedbackField) {
      var lastScoreMsg;
      var lastScore = getCookie("lastScore");
      if (lastScore === "") {

        setCookie("lastScore", result, 30);
      } else {
        if (lastScore < result) {
          lastScoreMsg = "Congrats! Your result is better than last of ";
        } else if (lastScore == result) {
          lastScoreMsg = "What? No progress? Your last score was the same: ";
        } else if (lastScore > result) {
          lastScoreMsg = "You did better last time with a score of ";
        }
        if (lastScore) {
          $(feedbackField).append("<p> " + lastScoreMsg + lastScore + '</p>');
        }
        setCookie("lastScore", result, 30);
      }
    }

    function verifyMultiSelectAnswer(selectedOption) {
      var answer = $(selectedOption).closest('li');
      if ($(selectedOption).attr('data-correctanswer')) {
        count++;
        answer.addClass('correctAnswer');
      } else {
        answer.addClass('incorrectAnswer');
      }
    }

    function verifyTextAnswer(userAnswer, correctAnswer, inputField) {
      if (userAnswer === correctAnswer) {
        count++;
        $(inputField).makeGreen();
      } else {
        $(inputField).makeRed();
      }
      return count;
    }

    function generateResultBar(feedbackField, resultPercentage, container) {
      if (resultPercentage === 100) {
        animateGreenBar(perfectScoreRandom);
      } else if (resultPercentage < 100 && resultPercentage >= 50) {
        animateGreenBar(goodScoreRandom);
      } else {
        animateRedBar();
      }

      function animateGreenBar(scoreType) {
        feedbackField.makeGreen().append(scoreType);
        fillProgressbar(container, 'progress-bar-success', resultPercentage);
      }

      function animateRedBar() {
        feedbackField.makeRed().append(lowScoreRandom);
        fillProgressbar(container, 'progress-bar-danger', resultPercentage);
      }
    }

    function fillProgressbar(container, barClass, resultPercentage) {
      container.find('.progress-bar').addClass(barClass).animate({
        "width": resultPercentage + '%'
      }, "fast");
    }

    function showExamResults(container) {
      examScore = examScore + count;
      var resultPercentage = calculateResultPercentage(examScore, maxPossibleExamScore);
      var feedbackField = container.find('.exerEvaluation');

      $(feedbackField).html(progressBar + '<p class="resultNum">' + examScore + '/' + maxPossibleExamScore + '</p>');
      generateResultBar(feedbackField, resultPercentage, container);

      if (compareWithLastScore) {
        displayScoreCompareMsg(examScore, feedbackField);
      }
    }

    function calculateResultPercentage(userScore, totalQuestions) {
      return userScore / totalQuestions * 100;
    }

    function checkMultiChoiceAnswers(exercise) {
      if (exercise.hasClass('multipleChoiceExercise')) {
        var userAnswers = exercise.find('.multiForm input:checked ');

        $(userAnswers).each(function() {
          verifyMultiSelectAnswer($(this));
        });
      }
    } // end of function

    function checkTextInputAnswers(quizTextInputs) {
      $(quizTextInputs).each(function() {
        var userAnswer = $(this).val().toLowerCase();
        var correctAnswer = $(this).data('correctanswer');
        var inputField = $(this);

        verifyTextAnswer(userAnswer, correctAnswer, inputField);
      });
    } // end of function

    function selectCorrectMultiChoiceAnswer(correctAnswers) {
      var randomBox = Math.floor(Math.random() * correctAnswers.length);
      var randSelectedOption = $(correctAnswers).eq(randomBox);
      randSelectedOption.prop('checked', true).closest('li').addClass('hint hinted');
    }

    function insertCorrectTextAnswer(randomUnansweredQuestion) {
      randomUnansweredQuestion.val(randomUnansweredQuestion.data('correctanswer')).makeGreen().closest('li')
        .addClass('hint').addClass("hinted")
        .delay(500).queue(function() {
          $(this).removeClass("hinted");
          $(this).dequeue();
        });
    }

    function updateHintsLeft() {
      hintsLeft--;
      hintBtn.val('Hint (' + hintsLeft + ' left)');
    }

    function displayCorrectAnswersBtn() {
      $('#showCorrectAnswersAll').css('display', 'inline-block');
    }

    function sanitizeUserInput() {
      $(textQuestions).keyup(function() {
        $(this).val($(this).val().replace(/ +?/g, ''));
      });
    }
    sanitizeUserInput();


    (function($) {
      $.fn.makeRed = function() {
        this.css({
          "background": "#fccec5",
          "border-color": "#ca3017",
          "color": "#ca3017"
        });
        return this;
      };
      $.fn.makeGreen = function() {
        this.css({
          "background": "#e6f8ad",
          "border-color": "#769c00",
          "color": "#769c00"
        });
        return this;
      };
      $.fn.makeWhite = function() {
        this.css({
          "background": "transparent",
          "border-color": "#c4c7cb",
          "color": "black"
        });
        return this;
      };
      $.fn.makeGrey = function() {
        this.css({
          "background": "#c4c7cb",
          "border-color": "#c4c7cb"
        });
        return this;
      };
      $.fn.clearIt = function() {
        this.html('').css({
          "background": "transparent",
          "color": "black"
        });
        return this;
      };
    }(jQuery));

  }); // end of doc.ready()

})(jQuery);
