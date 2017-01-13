/* jshint esversion:6 */
var SS;
$(function() {
    'use strict';

    var TIMER;
    var CURRENT = 0;
    var LAST_VALUE = 0;
    var PAUSED = false;

    var OVERRIDES = {};
    var SOUND;

    var SPEECH = {};
    var CURRENT_VOICE;

    var RATE = 1.0;

    // Events
    loadSpeech('data/speech.hero.json'); // TODO: Allow selection of speech.
    loadVoiceModel($('#voiceModel').val());

    $('body').on('click', '#play', playAll);
    $('body').on('click', '#pause', pause);
    $('body').on('click', '#stop', stop);
    $('body').on('click', '.play', play);
    $('#voiceModel').on('change', changeVoiceModel);
    $('body').on('click', '#toggleControl', toggleControl);
    $('body').on('change', '#rate', updateRate);

    // Functions
    function play(e) {
        /*jshint validthis:true */
        e.preventDefault();
        stop(e);

        var id = $(this).data('id').trim();
        var override = OVERRIDES[id];
        if (override) {
            // Override Data Format:
            /*
            "overrides": {
                "id3": {
                    "src": ["audio/konishi-o3.m4a"],
                    "sprite": {
                        "override": [3100, 1500]
                    }
                }
            }
             */
            var _sound = new Howl({
                src: OVERRIDES[id].src,
                rate: RATE,
                sprite: OVERRIDES[id].sprite,
            });
            _sound.play("override");
        } else {
            console.log(`Current Rate: ${SOUND.rate()}`);
            SOUND.play(id);
            SOUND.rate(RATE);
            console.log(`Updated Rate: ${SOUND.rate()}`);

            PAUSED = false;
            CURRENT = 0;
            TIMER = setInterval(iterateTimer, 1);
        }
        $(this).removeClass('btn-primary').addClass('btn-success');
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
            SOUND.rate(RATE);
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

        CURRENT_VOICE = this.value;
        console.log('Loading voice: ' + CURRENT_VOICE);
        $('.btn').prop('disabled', true);

        setTimeout(function() {
            loadVoiceModel(CURRENT_VOICE);
        }, 500);
    }

    function loadVoiceModel(voiceModel) {
        $.getJSON('data/' + voiceModel + '.json', function(data) {
            OVERRIDES = data.overrides;

            SOUND = new Howl({
                src: data.src,
                sprite: data.sprite,
                onend: function() {
                    clearInterval(TIMER);
                }
            });

            SS = SOUND; // DEBUG

            var _id;
            $(`.play.btn`).each(function(index, btn) {
                _id = $(btn).data('id');
                $(btn).prop('disabled', data.sprite[_id] ? false : true);
                $(btn).removeClass('btn-success').addClass('btn-primary');
                $(btn).parent().removeClass('has-override');
                if (OVERRIDES[_id]) {
                    $(btn).parent().addClass('has-override');
                }
            });
            $('.btn').not('.play').prop('disabled', false);

            // Uncomment for FOR MAPPING MODE ONLY
            // $('body').scrollTop($('button.play:enabled').last().position().top);
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

    function updateRate(e) {
        /*jshint validthis:true */
        RATE = this.value;
        RATE = RATE < 0.5 ? 0.5 : RATE;
        RATE = RATE > 4 ? 4 : RATE;
        this.value = RATE;
        console.log(`Rate changed to: ${RATE}`);
    }
});