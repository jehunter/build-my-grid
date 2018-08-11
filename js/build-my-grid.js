class BMGrid {
	constructor({target = '.bm-grid', rows = 12, columns = 12, block_classname = 'bm-grid-block', block_measure = '1em', block_max_x = 1, block_max_y = 1, grid_pattern = [], block_delay = -1, basic_css = false} = {}){
		this.target = target;
		this.rows = rows;
		this.columns = columns;
		this.area = rows * columns;
		this.blockClassName = block_classname;
		this.blockMeasure = block_measure;
		this.blockMaxX = block_max_x + 1;
		this.blockMaxY = block_max_y + 1;
		this.gridPattern = grid_pattern;
		this.gridPatternIndex = grid_pattern.length > 0 ? 0 : -1;
		this.usedCoordinates = [];
		this.blockDelay = block_delay;
		this.basicCSS = basic_css;
	}
	
	init() {
		// Add basic CSS if enabled
		if(this.basicCSS){
			let gridColCSS = '';
			let gridRowCSS = '';
			
			for(let i = 0; i < this.columns; i++){
				gridColCSS += ' ' + this.blockMeasure;
			}
			
			for(let j = 0; j < this.rows; j++){
				gridRowCSS += ' ' + this.blockMeasure;
			}
			
			var cssElem = document.createElement('style');
				cssElem.innerHTML = this.target + ' { font-size: 40px; display: grid; grid-gap: 10px; grid-template-columns:' + gridColCSS + '; grid-template-rows:' + gridRowCSS + '; background-color: #fff; color: #444; } .' + this.blockClassName + ' { background-color: #444; color: #fff; border-radius: 5px; padding: 5px; font-size: 0.5em; }';
			
			document.querySelector('head').appendChild(cssElem);
		}
		
		this.build();
	}
	
	build() {
		// Create grid block HTML DOM element	
		let block = document.createElement('div');
			block.classList.add(this.blockClassName);
			//block.innerHTML = document.querySelector(this.target).children.length + 1;
		
		// Go through each row
		for(let y = 1; y <= this.rows; y++){
			
			// Go through each column to find next available grid coordinate
			for(let x = 1; x <= this.columns; x++){
				
				// Only execute if current x,y coordinate is not in the this.usedCoordinates array
				if(this.usedCoordinates.indexOf(x + ',' + y) < 0){
					// Set initial values
					let randX = this.gridPatternIndex > -1 ? this.gridPattern[this.gridPatternIndex].split(',')[0] : this.getRandomInt(1, this.blockMaxX); // block length value
					let randY = this.gridPatternIndex > -1 ? this.gridPattern[this.gridPatternIndex].split(',')[1] : this.getRandomInt(1, this.blockMaxY); // block height value
					let xBoundary = 1;
					let yBoundary = 1;
					
					// Check X boundary to see if block width value is valid against neighbor blocks or grid edges
					for(let i = 0; i <= randX; i++){
						if(this.usedCoordinates.indexOf((x + i) + ',' + y) < 0 && ((x - 1) + i) <= this.columns){
							xBoundary = i;
						} else {
							break;
						}
					}
					
					// Check Y boundary to see if block width value is valid against neighbor blocks or grid edges
					for(let j = 0; j <= randY; j++){
						if(this.usedCoordinates.indexOf(x + ',' + (y + j)) < 0 && ((y - 1) + j) <= this.rows){
							yBoundary = j;
						} else {
							break;
						}
					}
					
					// Check X,Y boundary to see if block width value is valid against neighbor blocks or grid edges
					for(let a = y; a <= (y + yBoundary); a++){
						for(let b = x; b <= (x + xBoundary); b++){
							if(this.usedCoordinates.indexOf(b + ',' + a) < 0){
								continue;
							} else {
								yBoundary = a;
								break;
							}
						}
					}
					
					// Set endX and endY values for inline CSS grid declarations
					let endX = xBoundary == 1 ? x + 1 : x + xBoundary; // if xBoundary > 1, other wise x
					let endY = yBoundary == 1 ? y + 1 : y + yBoundary; // if yBoundary > 1, other wise y
					
					// Add coordinates to registry array for blocks with width and height of 1
					if(endX - x == 0 && endY - y == 0){
						block.classList.add('block-1-1');
						if(this.usedCoordinates.indexOf(x + ',' + y) < 0){
							this.usedCoordinates.push(x + ',' + y);
						}
					}
					
					// Add coordinates to registry array for blocks with width > 1 and height of 1
					if(endX - x > 0 && endY - y == 0) {
						block.classList.add('block-' + (endX - x) + '-1');
						for(let i = x; i < endX; i++){
							if(this.usedCoordinates.indexOf(i + ',' + y) < 0){
								this.usedCoordinates.push(i + ',' + y);
							}
						}
					}
					
					// Add coordinates to registry array for blocks with width of 1 and height > 1
					if(endX - x == 0 && endY - y > 0) {
						block.classList.add('block-1-' + (endY - y));
						for(let i = y; i < endY; i++){
							if(this.usedCoordinates.indexOf(x + ',' + i) < 0){
								this.usedCoordinates.push(x + ',' + i);
							}
						}
					}
					
					// Add coordinates to registry array for blocks with width and height > 1
					if(endX - x > 0 && endY - y > 0) {
						block.classList.add('block-' + (endX - x) + '-' + (endY - y));
						for(let i = y; i < endY; i++){
							for(let j = x; j < endX; j++){
								if(this.usedCoordinates.indexOf(j + ',' + i) < 0){
									this.usedCoordinates.push(j + ',' + i);
								} else{
									break;
								}
							}
						}
					}
					
					// Add inline CSS declarations to grid block HTML DOM element
					block.style.gridColumn = endX - x == 0 ? x : x + ' / ' + endX;
					block.style.gridRow = endY - y == 0 ? y : y + ' / ' + endY; 
					
					// Add grid block HTML DOM Element to grid wrapper element
					document.querySelector(this.target).appendChild(block);
					
					// If using pattern, update this.gridPatternIndex
					if(this.gridPatternIndex > -1){
						if(this.gridPatternIndex == (this.gridPattern.length - 1)){
							this.gridPatternIndex = 0;
						} else {
							this.gridPatternIndex = this.gridPatternIndex + 1; 
						}
					}
					
					// Continue building grid until all coordinates are occupied.
					if(this.usedCoordinates.length < this.area){
						if(this.blockDelay > -1){
							setTimeout(this.build.bind(this), this.blockDelay);
						} else {
							this.build();
						}
					}
					
					return;
				}
			}
		}
	}
	
	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}
}