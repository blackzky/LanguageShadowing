$(function() {
    var TIMER;
    var CURRENT = 0;
    var LAST_VALUE = 0;
    var PAUSED = false;

    var OVERRIDES = {};
    var SOUND;

    // Events
    loadVoiceModel($('#voiceModel').val());

    $('.kanji').tooltip({ placement: "top" });
    $('body').on('click', '#play', playAll);
    $('body').on('click', '#pause', pause);
    $('body').on('click', '#stop', stop);
    $('body').on('click', '.play', play);
    $('#voiceModel').on('change', changeVoiceModel);

    // Functions
    function play(e) {
        e.preventDefault();
        stop(e);
        var id = $(this).data('id').trim();
        SOUND.play(id);

        PAUSED = false;
        CURRENT = 0;
        TIMER = setInterval(iterateTimer, 1);
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
        console.log('loading: ' + this.value);
        $('.btn').prop('disabled', 'disabled');
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
});