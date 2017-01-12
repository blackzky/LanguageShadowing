var S;
$(function() {
    var TIMER;
    var CURRENT = 0;
    var PAUSED = false;

    var sound = new Howl({
        src: ['audio/speech.m4a'],
        sprite: {
            all: [0, 246000],
            id1: [2600, 2000],
            id2: [4300, 3900],
            id3: [8300, 2500]
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
        var id = $(this).data('id').trim();
        sound.play(id);
        console.log(`Playing: ${id}`);

        PAUSED = false;
        TIMER = setInterval(iterateTimer, 1);
    }

    function playAll(e) {
        e.preventDefault();
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
            CURRENT = sound.seek();
            $('#time').val(CURRENT);
        }

    }
});