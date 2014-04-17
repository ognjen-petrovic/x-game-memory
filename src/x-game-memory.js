(function(){ 

  function shuffleArray (array) {
      for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
      }
  };

  function createImgElements (game) {
    game.xImages.forEach(function(img, index, a){
      var src = img.src;
      a[index] = document.createElement('img');
      a[index].src = src;
      a[index].style.margin = 'auto';
      a[index].style.verticalAlign= 'middle';
      var div = document.createElement('div');
      div.style.height = game.xWrapHeight + 'px';
      div.style.width  = game.xWrapWidth + 'px';
      div.style.cssFloat = 'left';
      div.style.lineHeight= game.xWrapHeight + 'px';
      div.style.textAlign = 'center';
      div.style.margin = '2px';
      div.style.padding = '2px';
      div.style.border = '1px solid black';
      div.index = index;

      div.onclick = function(e){
        if(game._aOpenedImages.length < 2){
          game._aOpenedImages.push(e.target.firstChild.src);
          game._aOpenedindexes.push(e.target.index);
          game.xImages[e.target.index].style.visibility = 'visible';   
        }

        if(game._aOpenedImages.length == 2){

          if(game._waiting == true){
            return false;
          }

          //console.log(game._aOpenedImages[0] == game._aOpenedImages[1])
          if(game._aOpenedImages[0] == game._aOpenedImages[1]){
            game._aOpenedImages = [];
            game._aOpenedindexes = [];
            ++game._done;

            if(game._done == game.xImages.length/2){
              xtag.fireEvent(game, 'done');
            }

          }else{
            game._waiting = true;
            setTimeout(function(){
              game.xImages[game._aOpenedindexes[0]].style.visibility = 'hidden';
              game.xImages[game._aOpenedindexes[1]].style.visibility = 'hidden'; 
              game._aOpenedImages = [];
              game._aOpenedindexes = [];
              game._waiting = false;             
            }, 800)

          }

        }
      }


      game.xWraps.push(div);


    });
  };

  xtag.register('x-game-memory', {
    lifecycle: {
      created: function() {
        this.xLoadImages();
      },
      inserted: function() {},
      removed: function() {},
      attributeChanged: function() {}
    }, 
    events: {},
    accessors: {
      xColNum : {
        set:function (value) {this.setAttribute('data-col-num',value)},
        get:function () {return parseInt(this.getAttribute('data-col-num'))}
      },
      xImageSources : {
        set:function (value) {
            this.setAttribute('data-image-sources',JSON.stringify(value));
        },
        get:function () {return JSON.parse(this.getAttribute('data-image-sources'))}
      }
      
    }, 
    methods: {
      xLoadImages : function () {
        var sources = this.xImageSources;
        sources = sources.concat(sources);
        var loadedImgNum = 0;

        this.xWrapWidth = 0;
        this.xWrapHeight = 0;
        this.xImages = [];
        this.xWraps = [];

        var _this = this;
        sources.forEach(function(src, index){
          _this.xImages.push(new Image);
          _this.xImages[index].onload = function(){
            ++loadedImgNum

            if(this.width > _this.xWrapWidth)
              _this.xWrapWidth = this.width;

            if(this.height > _this.xWrapHeight)
              _this.xWrapHeight = this.height;

            if(loadedImgNum == sources.length){
              createImgElements(_this); 
              _this.xStartGame();
            }
          }

          _this.xImages[index].src = src; 
        });

      },
      xStartGame: function () {        
        var frag = xtag.createFragment();
        var colNum = this.xColNum
        var _this = this;

        this.innerHTML = '';
        this._aOpenedImages = [];
        this._aOpenedindexes = [];
        this._done = 0;
        this._waiting = false;
        shuffleArray(this.xImages);

        this.xImages.forEach(function(img, index){
          img.style.visibility = 'hidden';
          _this.xWraps[index].appendChild(img);
          frag.appendChild(_this.xWraps[index]);

          if((index+1) % colNum == 0)
            frag.appendChild(xtag.createFragment('<br style="clear:both">'));

        });

        this.appendChild(frag);
      }
    }
  });

})();
