var config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }
        }
    },
    scene: {
        preload: preload, // loading assets | images and such
        create: create, // creating | using of assets n such
        update: update // game clock, loop, time | game logic
    }
};

const game = new Phaser.Game(config);
let ground, player, 
platforms, platform, 
fruit, fruits,
bomb, bombs,
fruitCollected;
let fruitCount = 8;
let fruitsCollectedcount = 0;
let fruitsCollectedText = 0;

function preload ()
{
    // loading of assets
    this.load.image('background', './assets/background/background.jpg');
    this.load.image('fruit', './assets/misc/watermelon.png');
    this.load.image('platform', './assets/misc/platform.jpg');
    this.load.image('bomb', './assets/misc/bomb.png');
    this.load.spritesheet('dude', './assets/player/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
    this.physics.start()
    // background image
    this.add.image(config.width / 2, config.height / 2, 'background');

    // creating platforms using static group
    platforms = this.physics.add.staticGroup()
    platforms.enableBody = true

    for ( i = 0; i < 4; i ++)
    {
        ground = platforms.create(i * 660, 630, 'platform')
            .setScale(.2)
            .refreshBody()      // required, to apply the changes made in static group
    }
    platform = platforms.create(800, 400, 'platform')
        .setScale(.08)
        .refreshBody()
    platform = platforms.create(1000, 250, 'platform')
        .setScale(.08)
        .refreshBody()
    platform = platforms.create(-20, 200, 'platform')
        .setScale(.08)
        .refreshBody()
    platform = platforms.create(500, 150, 'platform')
        .setScale(.08)
        .refreshBody()
    platform = platforms.create(300, 450, 'platform')
        .setScale(.08)
        .refreshBody()

    // player added as sprite
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(.2);
    player.setCollideWorldBounds(true);
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    

    // creating fruits
    fruits = this.physics.add.group({   // create a dyanamic group for the fruits
        key: 'fruit',
        repeat: fruitCount,     // count of fruits to be created
        setXY: { x: 0, y: 0, stepX: 135 }     // x,y is for location while stepX is the distance between the fruits
    });
    fruits.children.iterate(function (child) {  // iterate all children then set bounceY between .4 and .8
        child.setBounceY(Phaser.Math.FloatBetween(0.8, 1));
        // child.setScale(.3);
        child.setScale(Phaser.Math.FloatBetween( .3, .5))
        child.y = Phaser.Math.Between(0,600);
        child.x = Phaser.Math.Between(200,config.width);
    });

    bombs = this.physics.add.group({
        key: 'bomb',
        repeat: 0,
        setXY: { x: 200, y: -200, stepX: 120 }
    });
    bombs.children.iterate(function (child) {  // iterate all children then set bounceY between .4 and .8
        child.setBounceY(1);
        child.setScale(.8);
        child.setVelocity(Phaser.Math.Between(-200, 200), 20);
        child.allowGravity = false;
        child.setCollideWorldBounds(true);
    });

    fruitCollected = this.add.text(config.width / 1.5, 20, 'Fruits Collected: 0', 
    { fontSize: '25px', fill: '#ffbb00' , fontStyle: 'bold' , fontFamily: 'roboto'}); // fruits collected text
    fruitCollected.setShadow(2, 2, '#000', 2, true, true);
    cursors = this.input.keyboard.createCursorKeys(); // keyboard controls
}

function update ()
{
    // collision detectors
    this.physics.add.collider(player, platforms)
    this.physics.add.collider(fruits, platforms)
    this.physics.add.overlap(player,fruits, fruitCollect, null, this)
    this.physics.add.collider(bombs, platforms)
    this.physics.add.overlap(player,bombs, bombHit, null, this)

    // player controls
    if (cursors.left.isDown) { player.setVelocityX(-600); player.anims.play('left', true); } // left

    else if (cursors.right.isDown) { player.setVelocityX(600) ; player.anims.play('right', true); } // right

    else { player.setVelocityX(0); player.anims.play('turn'); } // idle
    
    if (cursors.up.isDown && player.body.touching.down) { player.setVelocityY(-1000); player.anims.play('turn'); } // jump
}

// called when overlap happens between player and fruits | line 83
function fruitCollect(player, fruit) {
    fruit.disableBody(true, true);  // remove fruit
    
    fruitsCollectedcount += 1;
    fruitsCollectedText += 1 ;
    fruitCollected.setText('Fruits Collected: ' + fruitsCollectedText);
    
    if (fruits.countActive(true) < fruitCount )
    {
        fruit.enableBody(true, Phaser.Math.Between(0,config.width), 0, true ,true);
    } 

    // set player tint based on collected fruit
    if (fruitsCollectedcount == 1) { player.setTint(0xff4040) }
    if (fruitsCollectedcount == 2) { player.setTint(0xffac40) }
    if (fruitsCollectedcount == 3) { player.setTint(0xfff240) }
    if (fruitsCollectedcount == 4) { player.setTint(0x67ff3d) }
    if (fruitsCollectedcount == 5) { player.setTint(0x4056ff) }
    if (fruitsCollectedcount == 6) { player.setTint(0x4b0082) }
    if (fruitsCollectedcount == 7) { player.setTint(0x8000de); fruitsCollectedcount = 0}

    if (fruitsCollectedcount % 5 == 0) { player.setScale(player.scaleX * 1.1, player.scaleY * 1.1) }

    // win condition
    // if (fruitsCollectedText == 35)
    // {
    //     alert("Y O U  W O N !\nC O N G R A T S ! ! !")
    //     fruitsCollectedText = 0;
    // }
}

// loose condition | player collides with bomb
function bombHit(player, bombs){
    this.physics.pause();
    player.disableBody(true,true);
    let gameOverText = this.add.text(config.width / 2 - 200, config.height / 2 - 100, 'G A M E  O V E R', 
    { fontSize: '50px', fill: '#fff' , fontFamily: 'impact'});
    gameOverText.setShadow(3, 3, '#000000', 4, true, true);
}