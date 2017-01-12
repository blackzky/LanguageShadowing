var S;
$(function() {
    var TIMER;
    var CURRENT = 0;
    var LAST_VALUE = 0;
    var PAUSED = false;

    var sound = new Howl({
        src: ['audio/speech.m4a'],
        sprite: {
            all: [0, 246000],
            id1: [2600, 1700],
            id2: [4400, 3700],
            id3: [8300, 1900]
        }
    });

    S = sound; // DEBUG

    // Events
    $('.kanji').tooltip({ placement: "top" });
    $('body').on('click', '#play', playAll);
    $('body').on('click', '#pause', pause);
    $('body').on('click', '#stop', stop);
    $('body').on('click', '.play', play);


    // Functions
    function play(e) {
        e.preventDefault();
        stop(e);
        var id = $(this).data('id').trim();
        sound.play(id);
        console.log(`Playing: ${id}`);

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
            sound.seek(pos).play();
        } else {
            console.log('Play all');
            sound.play("all");
        }
        PAUSED = false;
        TIMER = setInterval(iterateTimer, 1);
    }

    function stop(e) {
        e.preventDefault();
        sound.stop();
        clearInterval(TIMER);
        $('#time').val(0);
    }

    function pause(e) {
        e.preventDefault();
        sound.pause();
        PAUSED = true;
        clearInterval(TIMER);
    }

    function iterateTimer() {
        if (PAUSED === false) {
            LAST_VALUE = sound.seek();
            if (LAST_VALUE > CURRENT) {
                CURRENT = sound.seek();
                $('#time').val(CURRENT);
            }
        }
    }
});