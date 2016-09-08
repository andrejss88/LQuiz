// New QUIZ
(function($) {

  $(document).ready(function() {

    var compareWithLastScore = true; // switch true/false for cookie score compare
    var secPerEasyExercise = 45; // seconds allocated per exercise if "easier" is chosen; change at will
    var secPerDiffExercise = 30; // seconds allocated per exercise if "harder" is chosen; change at will
    var showTimerOption = true; // false = do not show "Against time"
    var evaluateEntireQuiz = true; // true = one evaluation btn at the bottom; false = each exercise evaluated individually
    var hintsLeft; //   number of Hints (defined by quizDifficulty)

	
    hideQuizContainer();
    loadQuizHelp();


    $('#startQuiz').on('click', function() {
      $('.specialCharWrap').toggleClass('hidden'); // display generetad buttons of special chars
      $(this).addClass('hidden');
      $('#QuizDiff, #QuizExplanation').addClass('hidden');

      setQuizDifficulty();
      setTimer();
      $('#quizContainer').slideDown();
    });

    // resets all elements visibility to initial state
    $('#restartQuiz').on('click', function() {
      $('.specialCharWrap').toggleClass('hidden');
      $('#quizContainer').slideUp();
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

      var feedbackField = $(this).closest('.exerWrap').find('.exerEvaluation');
      feedbackField.clearIt();
    });

    var progressBar = '<div class="progress"> <div aria-valuemax="100" aria-valuemin="0" aria-valuenow="10" class="progress-bar progress-bar-striped" role="progressbar"></div></div>';

    textQuestions = $('.FillIn input[type=text]');

    /* Check ALL inputs (exam)
     ***********************************************/

    $('#checkExam').click(function() {
      window.clearTimeout(timer); // reset time

      count = 0;
      examScore = 0;
      var exercise = $('.exerWrap');
      var multiChoiceQuestions = $('.multiForm p');

      var container = $(this).closest('.exerWrap');
      maxPossibleScore = multiChoiceQuestions.length + textQuestions.length * 2; //text questions are of double value

      checkTextInputAnswers(textQuestions);
      checkMultiChoiceAnswers(exercise);

      showExamResults(container);

      displayCorrectAnswersBtn();
    }); // end of CheckExam

  $(".checkSingleExercise").click(function() {
      exerciseScore = 0;
      count = 0; // reset global var
      var container = $(this).closest('.exerWrap');
      var correctAnswers = $('.FillIn input').data('correctanswer');
      var textQuestions = container.find('.FillIn input[type=text]');

      checkTextInputAnswers(textQuestions);
      checkMultiChoiceAnswers(container);

      showExerciseResult(container);

      // display correct+clear buttons
     $(this).closest('.exerButtons ').find('.showCorrectAnswers, .clearAnswers').css('display', 'inline-block');
    });


    $("#showCorrectAnswersAll").click(function() {

      // display text answers
      $(textQuestions).each(function() {
        $(this).val($(this).data('correctanswer')).greenify();
      });

      // display MultiChoice answers
      var correctMultiChoiceAnswers = $('.multiForm input:radio[data-correctanswer]').next('span');
      $(correctMultiChoiceAnswers).each(function() {
        $(this).closest('li').addClass('correctAnswer checkedAnswer');
        $(this).closest('li').find('input').prop('checked', true);
      });
    });
	
	 $(".showCorrectAnswers").click(function() {
      var closest = $(this).closest('.exerWrap');
      var textQuestions = closest.find('.FillIn input[type=text]');
      $(textQuestions).each(function() {
        $(this).val($(this).data('correctanswer')).greenify();
      });
      // below - for radio
      var correctAnswers = closest.find('.multiForm input:radio[data-correctanswer]').next('span');
      $(correctAnswers).each(function() {
        $(this).closest('li').addClass('correctAnswer checkedAnswer');
        $(this).closest('li').find('input').prop('checked', true);
      });
    });

    $(".clearAnswers").click(function() {
      var closest = $(this).closest('.exerWrap');
      var feedbackField = closest.find('.exerEvaluation');
      if (closest.hasClass('FillinTheBlank') || closest.hasClass('RearrangeWords') || closest.hasClass('clearFinal')) {
        closest.find('.FillIn input[type=text]').val('').whitify();
        feedbackField.clearIt();
      } else if (closest.hasClass('multipleChoiceExercise')) {
        $('.multiForm li').removeClass();
        $('.multiForm input').prop('checked', false);

        feedbackField.clearIt();
      }
    }); // end of click


    /**********Hint: show one random correct answer **************/
    var hintBtn = $('.hintBtn');
    hintBtn.click(function() {
      var container = $(this).closest('.exerWrap');

      if (hintsLeft > 0) {
		   giveHint();
      } else {
        return false;
      }

      if (hintsLeft === 0) {
        hintBtn.val('No more hints');
        hintBtn.greyify();
      }
	  
	  function giveHint() {
        if (container.hasClass('FillinTheBlank') || container.hasClass('RearrangeWords')) {
          hintTextAnswer();
        } else if (container.hasClass('multipleChoiceExercise')) {
          hintMultiChoiceAnswer();
        }
      }

      function hintTextAnswer() {
        var unansweredQuestions = container.find('.FillIn input[type=text]').filter(function() {
          return !this.value;
        });
        var randomInput = Math.floor(Math.random() * unansweredQuestions.length);
        var randomUnansweredQuestion = $(unansweredQuestions).eq(randomInput);

        if (unansweredQuestions.length > 0) {
          hintsLeft--;
          updateHintsLeft();
          insertCorrectTextAnswer(randomUnansweredQuestion);
        }  
      }

      function hintMultiChoiceAnswer() {
        var correctAnswers = container.find('.multiForm input:radio[data-correctanswer]').not(':checked');
        if (correctAnswers.length > 0) {
          hintsLeft--;
          updateHintsLeft();
          selectCorrectMutliChoiceAnswer(correctAnswers);
        }
      }
    }); 

	
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
    /* fill in blank onpage 
     *******************************************************/
    var buttons = '';

    function createButtons(lettersToMatch) {
      $('.FillIn input').each(function() {
        var correctAnswer = $(this).attr('data-correctanswer');

        for (var i = 0; i < correctAnswer.length; i++) {
          var match = correctAnswer[i].match(new RegExp(lettersToMatch));
          if (match) {
            buttons += '<button>' + correctAnswer[i] + '</button>';
            lettersToMatch = lettersToMatch.replace(match[0], "");
          }
        }
      });
    }

    //Testing
    createButtons("[éèçêïëáíóúüñäöüß]");
    $('.specialCharWrap').append(buttons);

// TODO: FIXME
    $('.FillIn input').focus(function() {
      var buttons = $(".specialCharWrap");
      var $this = $(this);
      $that = $(this);
      $this.closest('p').after(buttons);
    });
    $('.specialCharWrap button').click(function() {
      var $this = $(this);
      var value = $(this).text();
      var input = $that;
      input.val(input.val() + value).focus();
      return false;
    });

    /* rest of code 
     ***********************************************/
  

    function showExerciseResult(container) {
      exerciseScore = exerciseScore + count;
	  var resultPercentage;
      var totalInputsCount = container.find('.FillIn input[type=text]').length * 2;
      var feedbackField = container.find('.exerEvaluation');
      var totalMultiChoiceQuestions = container.find('.multiForm p').length;
	  
      if (container.hasClass('FillinTheBlank') || container.hasClass('RearrangeWords')) {
        resultPercentage =  calculateResultPercentage(totalInputsCount);  
		displayScore(container, exerciseScore, totalInputsCount);
      } else if (container.hasClass('multipleChoiceExercise')) {
        resultPercentage = calculateResultPercentage(totalMultiChoiceQuestions); 
		displayScore(container, exerciseScore, totalMultiChoiceQuestions);
      }
	  
      animateBar(feedbackField, resultPercentage, container);
    }
	
	function calculateResultPercentage(totalQuestions){
		return exerciseScore / totalQuestions * 100 ;
	}
	
	
	function displayScore(container, userScore, maxScore){
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

    function timeRace() {
      clearTimeout(timer);
      $(' .exerEvaluationAll').after(timerContainer);
      $('#quizContainer').before(timerContainer);
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
      $('#quizContainer').append(overlay);
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

    function setTimer() {
      if ($('#timer').is(':checked')) {
        timeRace(); // start timer
      }
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

      if ($(selectedOption).attr('data-correctanswer')) {
        count++;
        $(selectedOption).closest('li').addClass('correctAnswer');
      } else {
        $(selectedOption).closest('li').addClass('incorrectAnswer');
      }
    }

	// TODO: refactor out the loop
    function verifyTextAnswer(userAnswer, correctAnswer, inputField) {
      var mistakesAllowed = 1;
      // to exclude one letter answers
      if (userAnswer === correctAnswer) {
        count = count + 2;
        $(inputField).greenify();
      } else if (correctAnswer.length > 1) {
        for (i = 0; i < correctAnswer.length; i++) {
          if (correctAnswer.charAt(i) !== userAnswer.charAt(i)) {
            mistakesAllowed--; // reduce one mistake allowed
            if (mistakesAllowed < 1) { // and if you have more mistakes than allowed
              count = count + 1;
              $(inputField).yellowfy();
            }
            if (mistakesAllowed < 0) {
              count = count - 2;
              $(inputField).redify();
              break;
            }
          }
        } // end for for()
      }
      if (correctAnswer.length == 1 && userAnswer !== correctAnswer) {
        $(inputField).redify();
      }
      return count;
    } // end of func

	// TODO: refactor
    function animateBar(feedbackField, resultPercentage, container) {
      if (resultPercentage === 100) {
        feedbackField.greenify().append(perfectScoreRandom);
        fillProgressbar(container, 'progress-bar-success', resultPercentage);
      } else if (resultPercentage < 100 && resultPercentage >= 50) {
        feedbackField.greenify().append(goodScoreRandom);
        fillProgressbar(container, 'progress-bar-success', resultPercentage);
      } else {
        feedbackField.redify().append(lowScoreRandom);
        fillProgressbar(container, 'progress-bar-danger', resultPercentage);
      } // end of "if else"	
    }

    function fillProgressbar(container, barClass, resultPercentage) {
      container.find('.progress-bar').addClass(barClass).animate({
        "width": resultPercentage + '%'
      }, "fast");
    }
	
// TODO: replace result calculation with existing function
    function showExamResults(container) {
      examScore = examScore + count;
      var resultPercentage = examScore / maxPossibleScore * 100;
      var feedbackField = container.find('.exerEvaluation');

      $(feedbackField).html(progressBar + '<p class="resultNum">' + examScore + '/' + maxPossibleScore + '</p>');
      animateBar(feedbackField, resultPercentage, container);

      if (compareWithLastScore) {
        displayScoreCompareMsg(examScore, feedbackField);
      }
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

    function selectCorrectMutliChoiceAnswer(correctAnswers) {
      var randomBox = Math.floor(Math.random() * correctAnswers.length);
      var randSelectedOption = $(correctAnswers).eq(randomBox);
      randSelectedOption.prop('checked', true).closest('li').addClass('hint hinted');
    }

    function insertCorrectTextAnswer(randomUnansweredQuestion) {
      randomUnansweredQuestion.val(randomUnansweredQuestion.data('correctanswer')).greenify().closest('li')
        .addClass('hint').addClass("hinted")
        .delay(500).queue(function() {
          $(this).removeClass("hinted");
          $(this).dequeue();
        });
    }
	
	function updateHintsLeft() {
      hintBtn.val('Hint (' + hintsLeft + ' left)');
    }
	
    function displayCorrectAnswersBtn() {
      $('#showCorrectAnswersAll').css('display', 'inline-block');
    }

    function sanitizeUserInput() {
      $('.FillIn input[type=text]').keyup(function() {
        $(this).val($(this).val().replace(/ +?/g, ''));
      });
    }
    sanitizeUserInput();


    (function($) {
      $.fn.redify = function() {
        this.css({
          "background": "#fccec5",
          "border-color": "#ca3017",
          "color": "#ca3017"
        });
        return this;
      };
      $.fn.greenify = function() {
        this.css({
          "background": "#e6f8ad",
          "border-color": "#769c00",
          "color": "#769c00"
        });
        return this;
      };
      $.fn.yellowfy = function() {
        this.css({
          "color": "#8a6d3b",
          "background-color": "#fcf8e3",
          "border-color": "#faebcc"
        });
        return this;
      };
      $.fn.whitify = function() {
        this.css({
          "background": "transparent",
          "border-color": "#c4c7cb",
          "color": "black"
        });
        return this;
      };
      $.fn.greyify = function() {
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
