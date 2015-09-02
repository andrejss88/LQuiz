// New QUIZ
(function ($) {

    $(document).ready(function () {
	
        var scoreCompare = true; // switch true/false for cookie score compare
        var secPerEasyExercise = 45; // seconds allocated per exercise if "easier" is chosen; change at will
        var secPerDiffExercise = 30; // seconds allocated per exercise if "harder" is chosen; change at will
        var showTime = true; // false = do not show "Against time"
        var evaluateEntireQuiz = true; // true = one evaluation btn at the bottom; false = each exercise evaluated individually


        var numHints; //   number of Hints (defined by Qdiff)
        var Qdiff; //  

        if (!showTime || !evaluateEntireQuiz) {
            $('#timwerWrap').addClass('hidden');
        }
        if(evaluateEntireQuiz){
        $('.checkAnswers').addClass('hidden');
        }
		  if(!evaluateEntireQuiz){
        $('.checkAnswersAll').addClass('hidden');
        }
        
         $('#gotit').click(function () {
            setCookie("gotIt", 'True', 30);
             $('#QuizExplanation').addClass('hidden');
        });

        checkQuizHelp();

        // start Quiz Button
        $('#StartQ').on('click', function () {
            $('.specialCharWrap').toggleClass('hidden'); // display generetad buttons of special chars
            var Qdiff = $('input[name="difficulty"]:checked', '#QuizDiff').attr('id');
            $(this).addClass('hidden');
			
            $('#QuizDiff, #QuizExplanation').addClass('hidden');
            $('#QuizAll').slideDown();
            if (Qdiff == "easier") {
                numHints = 3;
            } else {
                numHints = 1;
            }
            hintBtn.val('Hint (' + numHints + ' left)');
            if ($('#timer').is(':checked')) {
                timeRace(); // start timer
            }
        });
        // Restart Quiz Button
        $('#RestartQ').on('click', function () {
            $('.specialCharWrap').toggleClass('hidden');
            $('#QuizAll').slideUp();
            $('#StartQ, #QuizDiff').removeClass("hidden");
			$('.showCorrectAnswersAll').css('display','none');
			
			if(!evaluateEntireQuiz){
        $('.showCorrectAnswers, .clearAnswers').css('display','none');
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
			var closest = $(this).closest('.exerWrap'); // global var
			var FeedbackField = closest.find('.exerEvaluation');
			   FeedbackField.clearIt();
        });

        var ProgressBar = '<div class="progress"> <div aria-valuemax="100" aria-valuemin="0" aria-valuenow="10" class="progress-bar progress-bar-striped" role="progressbar"></div></div>';

        /* Check ALL inputs (exam)
         ***********************************************/
        $('#checkExam').click(function () {
            window.clearTimeout(timer); // reset time to 00
            count = 0;
            result = 0;
            var exerWrap = $('.exerWrap');
            var selRadioBtn = $('.multiForm p');
            var QuizInputs = $('.FillIn input[type=text]');
            var grandTotal = selRadioBtn.length + QuizInputs.length * 2;

            // loop through text inputs and compare answers
            $(QuizInputs).each(function () {
                matchAnswer($(this).val().toLowerCase(), $(this).data('correctanswer'), $(this));
            }); // end of each


            // loop through multi choice ones (radio btns)
            if (exerWrap.hasClass('multipleChoiceExercise')) {
                var MultiChoiceCount = exerWrap.find('.multiForm p').length;
                var selChckbx = exerWrap.find('.multiForm input:checked ');

                $(selChckbx).each(function () {
                    applyStyles(selChckbx);
                }); // end of loop 
            } // end of if 

            // add up the results
            result = result + count;
            var Resultpercentage = result / grandTotal * 100;
            closest = $(this).closest('.exerWrap'); // global var
            var FeedbackField = closest.find('.exerEvaluation');
            // insert the progres bar
            $(FeedbackField).html(ProgressBar + '<p class="resultNum">' + result + '/' + grandTotal + '</p>');

            // fill progress bar based on score
            animateProgBar(FeedbackField, Resultpercentage);


            if (scoreCompare) {
                checkCookie(result, FeedbackField);
            }
			 var closestButtonWrap = $(this).closest('.exerButtons ');
			$(closestButtonWrap).find('.showCorrectAnswersAll').css('display', 'inline-block');	
        }); // end of CheckExam


		
		  $(".showCorrectAnswersAll").click(function () {
            var totalQuestions =  ('.FillIn input[type=text]');
            $(totalQuestions).each(function () {
                $(this).val($(this).data('correctanswer')).greenify();
            });
            // below - for radio
            var correctCheckBoxes =  $('.multiForm input:radio[data-correctanswer]').next('span');
            $(correctCheckBoxes).each(function () {
                $(this).closest('li').addClass('correctAnswer checkedAnswer');
                $(this).closest('li').find('input').prop('checked', true);
            });
        });

 



        //** sanitize inputs for whitespace and tabs **//
        $('.FillIn input[type=text]').keyup(function () {
            $(this).val($(this).val().replace(/ +?/g, ''));
        });
        var hintBtn = $('.hintBtn');

        // hintBtn.val('Hint (' +numHints+ ' left)');
        /**********Hint Start **************/
        hintBtn.click(function () {
            var closest = $(this).closest('.exerWrap');
            var Unanswered = closest.find('.FillIn input[type=text]').filter(function () {
                return !this.value;
            });
            var randInput = Math.floor(Math.random() * Unanswered.length);
            var randSelectedQ = $(Unanswered).eq(randInput);
            
			if(Unanswered.length > 0){ // if there are still unanswered questions
			numHints--;
            if (closest.hasClass('FillinTheBlank') || closest.hasClass('RearrangeWords')) {

                if (numHints < 0) {
                    return false;
					
                } else {
                    hintBtn.val('Hint (' + numHints + ' left)');
                    randSelectedQ.val(randSelectedQ.data('correctanswer')).greenify().closest('li')
                        .addClass('hint').addClass("hinted")
                        .delay(500).queue(function () {
                        $(this).removeClass("hinted");
                        $(this).dequeue();
                    });
                }
            } // end of if
			} // end of bigger if
			
var correctCheckBoxes = closest.find('.multiForm input:radio[data-correctanswer]').not(':checked');
				if(correctCheckBoxes.length > 0){ // if there are still unanswered questions
				numHints--;
            if (closest.hasClass('multipleChoiceExercise')) {
                if (numHints < 0) {
                    return false;
                } else {
                    hintBtn.val('Hint (' + numHints + ' left)');
                    
                    var randomBox = Math.floor(Math.random() * correctCheckBoxes.length);
                    var randSelectedBox = $(correctCheckBoxes).eq(randomBox);
                    randSelectedBox.prop('checked', true).closest('li').addClass('hint').addClass("hinted");

                }
            }
			}
			
            if (numHints < 1) {
                hintBtn.val('No more hints');
				hintBtn.greyify();
            }
        }); // end of Hint click


        /**********Hint End **************/

        var Afeedback1 = '<p class="quizSummaryText">Excellent!</p>';

        var Afeedback2 = '<p class="quizSummaryText">Brilliant!</p>';
        var Afeedback3 = '<p class="quizSummaryText">Impressive!</p>';

        var Bfeedback1 = '<p class="quizSummaryText">Very good!</p>';
        var Bfeedback2 = '<p class="quizSummaryText">Good work!</p>';
        var Bfeedback3 = '<p class="quizSummaryText">Well done!</p>';

        var Cfeedback1 = '<p class="quizSummaryText">Meh...</p>';

        var perfectScore = [Afeedback1, Afeedback2, Afeedback3];

        var AscoreRand = perfectScore[Math.floor(Math.random() * perfectScore.length)];

        var goodScore = [Bfeedback1, Bfeedback2, Bfeedback3];
        var BscoreRand = goodScore[Math.floor(Math.random() * goodScore.length)];

        var okScore = [Cfeedback1];
        var CscoreRand = okScore[Math.floor(Math.random() * okScore.length)];
        /* fill in blank onpage 
         *******************************************************/
        var buttons = '';

        function createButtons(lettersToMatch) {
            $('.FillIn input').each(function () {
                var corrAns = $(this).attr('data-correctanswer');

                for (var i = 0; i < corrAns.length; i++) {
                    var match = corrAns[i].match(new RegExp(lettersToMatch));
                    if (match) {
                        buttons += '<button>' + corrAns[i] + '</button>';
                        lettersToMatch = lettersToMatch.replace(match[0], "");
                    }
                }
            });
        }

        //Testing
        createButtons("[éèçêïëáíóúüñäöüß]");
        $('.specialCharWrap').append(buttons);


        $('.FillIn input').focus(function () {
            var buttons = $(".specialCharWrap");
            var $this = $(this);
            $that = $(this);
            $this.closest('p').after(buttons);
        });
        $('.specialCharWrap button').click(function () {
            var $this = $(this);
            var value = $(this).text();
            var input = $that;
            input.val(input.val() + value).focus();
            return false;
        });
		
        /* rest of code 
         ***********************************************/
        $(".checkAnswers").click(function () {
            var result = 0;
            count = 0; // global var
            closest = $(this).closest('.exerWrap'); // global var
            var FeedbackField = closest.find('.exerEvaluation');
            var correctAnswers = $('.FillIn input').data('correctanswer');
            var totalInputsCount = closest.find('.FillIn input[type=text]').length * 2;
            var totalQuestions = closest.find('.FillIn input[type=text]');

            // display correct+clear buttons
            var closestButtonWrap = $(this).closest('.exerButtons ');
            $(closestButtonWrap).find('.showCorrectAnswers, .clearAnswers').css('display','inline-block');

            $(totalQuestions).each(function () {
                matchAnswer($(this).val().toLowerCase().trim(), $(this).data('correctanswer'), $(this));
            });
            //  for radio
            if (closest.hasClass('multipleChoiceExercise')) {

                var MultiChoiceCount = closest.find('.multiForm p').length;
                var selChckbx = closest.find('.multiForm input:checked ');

                $(selChckbx).each(function () {
                    applyStyles(selChckbx);
                }); // end of loop 
            } // end of if

            // result counting
            result = result + count;
            if (closest.hasClass('FillinTheBlank') || closest.hasClass('RearrangeWords')) {
                Resultpercentage = result / totalInputsCount * 100;

                closest.find('.exerEvaluation').html(ProgressBar + '<p class="resultNum">' + result + '/' + totalInputsCount + '</p>');

            } else if (closest.hasClass('multipleChoiceExercise')) {
                closest.find('.exerEvaluation').html(ProgressBar + '<p class="resultNum">' + result + '/' + MultiChoiceCount + '</p>');
                var Resultpercentage = result / MultiChoiceCount * 100;

            }
            animateProgBar(FeedbackField, Resultpercentage);

        }); // end of click

        $(".showCorrectAnswers").click(function () {
            var closest = $(this).closest('.exerWrap');
            var totalQuestions = closest.find('.FillIn input[type=text]');
            $(totalQuestions).each(function () {
                $(this).val($(this).data('correctanswer')).greenify();
            });
            // below - for radio
            var correctCheckBoxes = closest.find('.multiForm input:radio[data-correctanswer]').next('span');
            $(correctCheckBoxes).each(function () {
                $(this).closest('li').addClass('correctAnswer checkedAnswer');
                $(this).closest('li').find('input').prop('checked', true);
            });
        });

        $(".clearAnswers").click(function () {
            var closest = $(this).closest('.exerWrap');
            var FeedbackField = closest.find('.exerEvaluation');
            if (closest.hasClass('FillinTheBlank') || closest.hasClass('RearrangeWords') || closest.hasClass('clearFinal')) {
                closest.find('.FillIn input[type=text]').val('').whitify();
                FeedbackField.clearIt();
            } else if (closest.hasClass('multipleChoiceExercise')) {
                $('.multiForm li').removeClass();
                $('.multiForm input').prop('checked', false);

                FeedbackField.clearIt();
            }
        }); // end of click

        /* end of fill in quiz
         *****************************************************/
        /* START multiple choice quiz
         ************************************/
        $('.multiForm span').click(function () {
            $(this).closest('li').find('input').click();

        });
        /* END multiple choice quiz
         ***********************************************/
 
        /**********Timer start **************/

        var timer;
        var ExerNum = $('.exerWrap').length;
        var timerDiv = '<div class=" row timerWrap"> <div class="col-sm-8 text-center">  </div> <div class="col-sm-4">  </div>  </div>';

        function timeRace() {
            clearTimeout(timer);
            $(' .exerEvaluationAll').after(timerDiv);
            $('#QuizAll').before(timerDiv);
            var Qdiff = $('input[name="difficulty"]:checked', '#QuizDiff').attr('id');
            if (document.getElementById("timer").checked) {
                if (Qdiff == "easier") {
                    sec = (secPerEasyExercise * ExerNum) % 60;
                    min = Math.floor((secPerEasyExercise * ExerNum) / 60);
                } else {
                    sec = (secPerDiffExercise * ExerNum) % 60;
                    min = Math.floor((secPerDiffExercise * ExerNum) / 60);
                }
            } // end of if
            countDown();
        } // end of function 



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
            $(timerDiv).html(time);
            $('.timerWrap > .text-center').html(time);
            timer = window.setTimeout(countDown, 1000);

            if (min == '00' && sec == '00') {
                sec = "00";
                window.clearTimeout(timer);
                //  alert('time is up');
                timeEnded();
            }
        }

        function timeEnded() {
            var overlay = '<div class="overlay-bg"><div class="overlay-content">Time is up!</div>   </div>';
            $('#QuizAll').append(overlay);
            $('.overlay-bg').fadeIn("fast").delay(1200).fadeOut("fast");
        }
        /**********Timer End **************/
        
          function checkQuizHelp() {
               gotIt = getCookie("gotIt");
            if (gotIt !== null) {
                $('#QuizExplanation').addClass('hidden');
            }
        }

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

        function checkCookie(result, FeedbackField) {
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
                    $(FeedbackField).append("<p> " + lastScoreMsg + lastScore + '</p>');
                }
                setCookie("lastScore", result, 30);
            }
        }

        function applyStyles(selChckbx) {

            if ($(selChckbx).attr('data-correctanswer')) {
                count++;
                $(selChckbx).closest('li').addClass('correctAnswer');
            } else {
                $(selChckbx).closest('li').addClass('incorrectAnswer');
            }
        }

        function matchAnswer(UserAnswer, corrAns, QuizInput) {
            var mistakesAllowed = 1;
            // to exclude one letter answers
            if (UserAnswer === corrAns) {
                count = count + 2;
                $(QuizInput).greenify();
            } else if (corrAns.length > 1) {
                for (i = 0; i < corrAns.length; i++) {
                    if (corrAns.charAt(i) !== UserAnswer.charAt(i)) {
                        mistakesAllowed--; // reduce one mistake allowed
                        if (mistakesAllowed < 1) { // and if you have more mistakes than allowed
                            count = count + 1;
                            $(QuizInput).yellowfy();
                        }
                        if (mistakesAllowed < 0) {
                            count = count - 2;
                            $(QuizInput).redify();
                            break;
                        }
                    }
                } // end for for()
            }
            if (corrAns.length == 1 && UserAnswer !== corrAns) {
                $(QuizInput).redify();
            }
            return count;
        } // end of func

        function animateProgBar(FeedbackField, Resultpercentage) {
            if (Resultpercentage === 100) {
                FeedbackField.greenify().append(AscoreRand);
                closest.find('.progress-bar').addClass('progress-bar-success').animate({
                    "width": Resultpercentage + '%'
                }, "fast");
            } else if (Resultpercentage < 100 && Resultpercentage >= 50) {
                FeedbackField.greenify().append(BscoreRand);
                closest.find('.progress-bar').addClass('progress-bar-success').animate({
                    "width": Resultpercentage + '%'
                }, "fast");
            } else {
                FeedbackField.redify().append(CscoreRand);
                closest.find('.progress-bar').addClass('progress-bar-danger').animate({
                    "width": Resultpercentage + '%'
                }, "fast");
            } // end of "if else"	
        }

        (function ($) {
            $.fn.redify = function () {
                this.css({
                    "background": "#fccec5",
                        "border-color": "#ca3017",
                        "color": "#ca3017"
                });
                return this;
            };
            $.fn.greenify = function () {
                this.css({
                    "background": "#e6f8ad",
                        "border-color": "#769c00",
                        "color": "#769c00"
                });
                return this;
            };
            $.fn.yellowfy = function () {
                this.css({
                    "color": "#8a6d3b",
                        "background-color": "#fcf8e3",
                        "border-color": "#faebcc"
                });
                return this;
            };
            $.fn.whitify = function () {
                this.css({
                    "background": "transparent",
                        "border-color": "#c4c7cb",
                        "color": "black"
                });
                return this;
            };
			   $.fn.greyify = function () {
                this.css({
                    "background": "#c4c7cb",
                        "border-color": "#c4c7cb"
                });
                return this;
            };
            $.fn.clearIt = function () {
                this.html('').css({
                    "background": "transparent",
                        "color": "black"
                });
                return this;
            };
        }(jQuery));



    }); // end of doc.ready()

})(jQuery);