/* jshint esversion:6 */

$(function() {
    'use strict';

    var TIMER;
    var CURRENT = 0;
    var LAST_VALUE = 0;
    var PAUSED = false;

    var OVERRIDES = {};
    var SOUND;

    var SPEECH = {};

    // Events
    loadVoiceModel($('#voiceModel').val());
    // TODO: Allow selection of speech.
    loadSpeech('data/speech.hero.json');

    $('body').on('click', '#play', playAll);
    $('body').on('click', '#pause', pause);
    $('body').on('click', '#stop', stop);
    $('body').on('click', '.play', play);
    $('#voiceModel').on('change', changeVoiceModel);
    $('body').on('click', '#toggleControl', toggleControl);

    // Functions
    function play(e) {
        /*jshint validthis:true */
        e.preventDefault();
        stop(e);

        var id = $(this).data('id').trim();
        SOUND.stop(id);
        var override = OVERRIDES[id];
        if (override) {
            var _sound = new Howl({
                src: OVERRIDES[id].src,
                sprite: OVERRIDES[id].sprite,
                onend: function() {
                    console.log('end');
                },
                onload: function() {
                    console.log('load');
                }
            });
            _sound.play("override");
        } else {
            SOUND.play(id);

            PAUSED = false;
            CURRENT = 0;
            TIMER = setInterval(iterateTimer, 1);
        }
        $(this).removeClass('btn-primary');
        $(this).addClass('btn-success');
    }

    function playAll(e) {
        e.preventDefault();
        stop(e);
        if (PAUSED === true) {
            var pos = $('#time').val();
            console.log(`Play starting @ ${pos}`);
            SOUND.seek(pos).play();
        } else {
            console.log('Play all');
            SOUND.play("all");
        }
        PAUSED = false;
        TIMER = setInterval(iterateTimer, 1);
    }

    function stop(e) {
        e.preventDefault();
        SOUND.stop();
        clearInterval(TIMER);
        $('#time').val(0);
    }

    function pause(e) {
        e.preventDefault();
        SOUND.pause();
        PAUSED = true;
        clearInterval(TIMER);
    }

    function iterateTimer() {
        if (PAUSED === false) {
            LAST_VALUE = SOUND.seek();
            if (LAST_VALUE > CURRENT) {
                CURRENT = SOUND.seek();
                $('#time').val(CURRENT);
            }
        }
    }

    function changeVoiceModel(e) {
        /*jshint validthis:true */
        console.log('Loading voice: ' + this.value);
        $('.btn').each(function(index, btn) {
            $(btn).prop('disabled', 'disabled');
            if ($(btn).hasClass('btn-success')) {
                $('.btn').not("#toggleControl").removeClass('btn-success');
                $('.btn').not("#toggleControl").addClass('btn-primary');
            }
        });
        loadVoiceModel(this.value);
    }

    function loadVoiceModel(voiceModel) {
        $.getJSON('data/' + voiceModel + '.json', function(data) {
            OVERRIDES = data.overrides;

            SOUND = new Howl({
                src: data.src,
                sprite: data.sprite,
                onend: function() {
                    clearInterval(TIMER);
                },
                onload: function() {
                    $('.btn').prop('disabled', false);
                }
            });
        });
    }

    function toggleControl(e) {
        /*jshint validthis:true */
        e.preventDefault();
        var text = $(this).text();
        if (text === 'Hide Controls') {
            $(this).text('Show Controls');
            $('#controls').hide();
        } else {
            $(this).text('Hide Controls');
            $('#controls').show();
        }
        $('#speechContainer').toggleClass('hiddenControls');
    }

    function loadSpeech(path) {
        $.getJSON(path, function(data) {
            SPEECH = SPEECH || {};

            SPEECH.title = data.title;
            SPEECH.sentences = data.sentences;

            $('#speechTitle').text(SPEECH.title);

            var _btn = '';
            SPEECH.sentences.forEach(function(sentence, index) {
                _btn = `<button class='play btn btn-primary' data-id='id${index+1}'>Play</button>`;
                sentence = XRegExp.replaceEach(sentence, [
                    [/\[(.*?)\]\((.*?)\)/g, function($0) {
                        var kanji = arguments[1];
                        var kana = arguments[2];
                        return `<span class="kanji" title="${kana}">${kanji}</span>`;
                    }]
                ]);
                $('#speechSentences').append(`<p>${_btn} ${sentence}</p>`);
            });

            // IMPORTANT to enable tooltip!
            $('.kanji').tooltip({ placement: "top" });
        });
    }
});