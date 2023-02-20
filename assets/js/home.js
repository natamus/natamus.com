let clickedbubble = null;
let distancedragged = 0;

const urldescriptions = { "serilum.com" : "A collection of Minecraft mods hosted on CurseForge and Modrinth.", "discord.modularity.gg" : "A collection of modular Discord bots.", "natamus.com" : "A software company.", "ricksouth.com" : "The personal website of the founder of Natamus." }

$(document).ready(function(e) {
	console.log("Loading https://natamus.com/");
});

$(document).on('mousemove', function( e ) {
	if (clickedbubble != null) {
		if (clickedbubble.dragging) {
			clickedbubble.fx = e.pageX - clickedbubble.ox;
			clickedbubble.fy = e.pageY - clickedbubble.oy;
			distancedragged += 1;
		}
	}
});

$(document).on('mouseup',function( e ) {
	if (clickedbubble != null) {
		clickedbubble.dragStop(e);
	}
});

$(document).on('mouseenter mouseleave', '.bubble', function (e) {
	let isinside = e.type === 'mouseenter';
	let url = $(this)[0].outerHTML.split("--url: ")[1].split(";")[0];
	let identifier = url.replaceAll("https:", "").replaceAll("/", "");

	if (isinside) {
		$(".titlewrapper").show();
		$(".titlewrapper .header span").html(url);
		$(".titlewrapper .subheader span").html(urldescriptions[identifier]);
	}
	else {
		$(".titlewrapper").hide();
	}
});

function processBubbleClick(element) {
	let url = element.outerHTML.split("--url: ")[1].split(";")[0];
	window.open(url, '_blank').focus();
}

// Bubble Logic
class Bubble {
	constructor(datum) {
		this.dragging = false;
		this.dragTimer = null;
		this.element = undefined;
		this.elementCircle = undefined;
		this.elementControl = undefined;

		this.property = Object.assign({
			id: null,
			parentId: null,
			active: null,
			color: undefined,
			backgroundimage: undefined,
			url: undefined,
			index: null,
			radius: null,
			scale: null,
			fx: null,
			fy: null,
			ox: null,
			oy: null,
			vx: null,
			vy: null,
			x: null,
			y: null
		}, datum);

		this.styleVariables = [
			'color',
			'backgroundimage',
			'url',
			'radius',
			'scale',
			'x',
			'y'
		];

		this.bindMethodContexts([
			'dragStart',
			'dragMove',
			'dragStop',
			'mouseLeave'
		]);

		this.setup();
	}

	bindMethodContexts(methodNames) {
		methodNames.forEach((methodName) => {
			this[methodName] = this[methodName].bind(this);
		})
	}

	dataTween(transition, propertyName, targetValue, step = () => {}) {
		return transition.tween(`data.${propertyName}`, (datum) => {
			const interpolator = this.interpolate(datum[propertyName], targetValue);

			return (time) => {
				datum[propertyName] = interpolator(time);
				step();
			}
		});
	}

	dragStart(event) {
		clickedbubble = this;
		distancedragged = 0;

		const {
			EVENT_DRAG_START
		} = this.constructor;

		let x;
		let y;

		if (event.type === 'mousedown') {
			x = event.clientX;
			y = event.clientY;

		} else if (event.touches.length !== 1) {
			return;
		} else {
			x = event.touches[0].clientX;
			y = event.touches[0].clientY;
		}

		this.dragging = true;

		this.ox = x - this.x;
		this.oy = y - this.y;

		this.fx = this.x;
		this.fy = this.y;

		this.element.dispatchEvent(new CustomEvent(EVENT_DRAG_START, {
			bubbles: true,
			detail: this
		}));
	}

	dragMove(event) {
		if (!this.dragging) {
			return;
		}

		let x;
		let y;

		if (event.type === 'mousemove') {
			event.preventDefault();

			x = event.clientX;
			y = event.clientY;
		} else {
			x = event.touches[0].clientX;
			y = event.touches[0].clientY;
		}

		this.fx = x - this.ox;
		this.fy = y - this.oy;
	}

	async dragStop(event) {
		if (event.type !== 'mouseup') {
			return;
		}

		if (distancedragged < 10) {
			processBubbleClick(clickedbubble.element);
		}

		clickedbubble = null;
		distancedragged = 0;

		const {
			EVENT_DRAG_STOP
		} = this.constructor;

		if (event.type === 'mouseleave' || event.type === 'mouseup') {
			clearTimeout(this.dragTimer);
			event.preventDefault();
		}

		this.dragging = false;

		this.fx = null;
		this.fy = null;

		this.element.dispatchEvent(new CustomEvent(EVENT_DRAG_STOP, {
			bubbles: true,
			detail: this
		}));
	}

	enter() {
		return this.tween({
			duration: 600,
			ease: d3.easeBackOut,
			propertyName: 'scale',
			targetValue: 1
		});
	}

	exit() {
		return this.tween({
			duration: 600,
			ease: d3.easeBackIn,
			propertyName: 'scale',
			targetValue: 0
		});
	}

	hasParent() {
		return this.property.parentId !== null;
	}

	interpolate(from, to) {
		return (ratio) => from * (1 - ratio) + to * ratio;
	}

	isChildOf(bubble) {
		return this.property.parentId === bubble.property.id;
	}

	mouseLeave(event) {
		if (this.dragging) {
			this.dragStop(event).then();
		}
	}

	tween({ duration, ease = d3.easeLinear, propertyName, targetValue }) {
		return new Promise((resolve) => {
			const startTimestamp = performance.now();
			const startValue = this[propertyName];

			const interpolator = (ratio) => {
				return (startValue * (1 - ratio)) + (targetValue * ratio);
			};

			const tick = (currentTimestamp) => {
				const ratio = Math.min(1, Math.max(0, (currentTimestamp - startTimestamp) / duration));

				this[propertyName] = interpolator(ease(ratio));

				if (ratio < 1) {
					requestAnimationFrame(tick);
				} else {
					resolve();
				}
			};

			requestAnimationFrame(tick);
		})
	}

	roundToFixed(number, digits) {
		return parseFloat(number.toFixed(digits));
	}

	setup() {
		const {
			CLASS_BUBBLE,
			CLASS_CIRCLE,
			CLASS_CONTROL
		} = this.constructor;

		this.element = document.createElement('label');
		this.element.addEventListener('mousedown', this.dragStart);
		this.element.addEventListener('mousemove', this.dragMove);
		this.element.addEventListener('mouseup', this.dragStop);
		this.element.addEventListener('mouseleave', this.mouseLeave);
		this.element.addEventListener('touchstart', this.dragStart);
		this.element.addEventListener('touchmove', this.dragMove);
		this.element.addEventListener('touchend', this.dragStop);
		this.element.addEventListener('touchcancel', this.dragStop);
		this.element.classList.add(CLASS_BUBBLE);

		this.styleVariables.forEach((propertyName) => {
			this.updateStyleVariable(propertyName, this.property[propertyName]);
		})

		this.elementControl = document.createElement('input');
		this.elementControl.type = 'checkbox';
		this.elementControl.classList.add(CLASS_CONTROL);
		this.element.append(this.elementControl);

		this.elementCircle = document.createElement('span');
		this.elementCircle.classList.add(CLASS_CIRCLE);
		this.element.append(this.elementCircle);
	}

	updateStyleVariable(variableName, variableValue) {
		if (variableValue === null || variableValue === undefined) {
			this.element.style.removeProperty(`--${variableName}`);

			return;
		}

		switch (variableName) {
			case 'scale':
				variableValue = this.roundToFixed(variableValue, 5);

				break;
			case 'x':
			case 'y':
				variableValue = this.roundToFixed(variableValue, 1);

				break;
		}

		this.element.style.setProperty(`--${variableName}`, variableValue);
	}

	waitForNextRepaint() {
		return new Promise(resolve => requestAnimationFrame(resolve));
	}

	get color() {
		return this.property.color;
	}

	set color(value) {
		this.property.color = value;
		this.updateStyleVariable('color', value);
	}

	get index() {
		return this.property.index;
	}

	set index(value) {
		this.property.index = value;
	}

	get backgroundimage() {
		return this.property.backgroundimage;
	}

	set backgroundimage(value) {
		this.property.backgroundimage = value;
		this.updateStyleVariable('backgroundimage', value);
	}

	get url() {
		return this.property.url;
	}

	set url(value) {
		this.property.url = value;
		this.updateStyleVariable('url', value);
	}

	get radius() {
		return this.property.radius;
	}

	set radius(value) {
		this.property.radius = value;
		this.updateStyleVariable('radius', value);
	}

	get scale() {
		return this.property.scale;
	}

	set scale(value) {
		this.property.scale = value;
		this.updateStyleVariable('scale', value);
	}

	get x() {
		return this.property.x;
	}

	set x(value) {
		this.property.x = value;
		this.updateStyleVariable('x', value);
	}

	get y() {
		return this.property.y;
	}

	set y(value) {
		this.property.y = value;
		this.updateStyleVariable('y', value);
	}
}

Bubble.CLASS_BUBBLE = 'bubble';
Bubble.CLASS_CIRCLE = 'circle';
Bubble.CLASS_CONTROL = 'control';
Bubble.EVENT_DRAG_START = 'drag-start';
Bubble.EVENT_DRAG_STOP = 'drag-stop';

class Bubbles {
	constructor(data) {
		this.autoUpdateTimer = null;
		this.collection = [ ];
		this.data = data;
		this.element = undefined;
		this.simulation = undefined;

		this.option = {
			collideForceStrength: 1,
			xForceStrength: 0.05,
			yForceStrength: 0.05,

			bubbleEnterDelay: 300,
			bubbleExitDelay: 300
		};

		this.bindMethodContexts([
			'dragStart',
			'dragStop'
		]);
	}

	autoUpdateSimulation(active) {
		if (!active) {
			cancelAnimationFrame(this.autoUpdateTimer);
			return;
		}

		this.autoUpdateTimer = requestAnimationFrame(this.autoUpdateSimulation.bind(this, active));
		this.updateSimulation();
	}

	bindMethodContexts(methodNames) {
		methodNames.forEach((methodName) => {
			this[methodName] = this[methodName].bind(this);
		})
	}

	async callWhileUpdate(bubbles, mapper) {
		this.autoUpdateSimulation(true);
		await Promise.all(bubbles.map(mapper));
		this.autoUpdateSimulation(false);
	}

	dragStart(event) {
		this.restartSimulation();
		this.autoUpdateSimulation(true);
	}

	dragStop() {
		this.autoUpdateSimulation(false);
	}

	async enter(bubbles = this.getActive()) {
		await this.callWhileUpdate(bubbles, async (bubble) => {
			await this.waitFor(this.random(0, this.option.bubbleEnterDelay));
			return bubble.enter();
		})
	}

	async exit(bubbles = this.getActive()) {
		await this.callWhileUpdate(bubbles, async (bubble) => {
			await this.waitFor(this.random(0, this.option.bubbleExitDelay));
			return bubble.exit();
		})
	}

	getActive() {
		return this.collection.filter(bubble => bubble.active);
	}

	random(minimum, maximum) {
		return (Math.random() * (maximum - minimum)) + minimum;
	}

	render(bubbles = this.getActive()) {
		this.element.append(...bubbles.map(bubble => bubble.element));
	}

	restartSimulation() {
		this.simulation.alphaTarget(0.1).restart();
	}

	setup() {
		const {
			CLASS_BUBBLES
		} = this.constructor;

		this.element = document.querySelector(`.${CLASS_BUBBLES}`);
		this.element.addEventListener(Bubble.EVENT_DRAG_START, this.dragStart);
		this.element.addEventListener(Bubble.EVENT_DRAG_STOP, this.dragStop);

		const center = {
			x: this.element.clientWidth * 0.5,
			y: this.element.clientHeight * 0.5
		};

		this.collection = this.data.map((datum) => {
			const bubble = new Bubble(datum);

			if (!bubble.hasParent()) {
				bubble.active = true;
				bubble.x = center.x + this.random(-bubble.radius, bubble.radius);
				bubble.y = center.y + this.random(-bubble.radius, bubble.radius);
			}

			return bubble;
		});

		this.simulation = d3
			.forceSimulation()
			.force('collide', d3.forceCollide(bubble => (bubble.radius * bubble.scale) + 2).strength(this.option.collideForceStrength))
			.force('forceX', d3.forceX(center.x).strength(this.option.xForceStrength))
			.force('forceY', d3.forceY(center.y).strength(this.option.yForceStrength))
	}

	async start() {
		this.setup();
		this.render();
		await this.enter();
	}

	updateSimulation() {
		this.simulation.nodes(this.getActive());
	}

	waitFor(delay) {
		return new Promise(resolve => setTimeout(resolve, delay));
	}
}

Bubbles.CLASS_BUBBLES = 'bubbles';

function generateDatum(index, color, backgroundimage, url) {
	return {
		id: index + 1,
		index,
		color,
		backgroundimage,
		url,
		radius: 60,
		scale: 0
	};
}

function generateData() {
	const data = [ ];

	const backgroundimages = [
		'natamus.png',
		'serilum.png',
		'discordbots.png',
		'rick.png'
	];

	const urls = [
		'https://natamus.com/',
		'https://serilum.com/',
		'https://discord.modularity.gg/',
		'https://ricksouth.com/'
	];

	for (let index = 0; index < backgroundimages.length; index++) {
		if (backgroundimages[index] === '') {
			continue;
		}

		const backgroundimage = 'url("/assets/images/' + backgroundimages[index] + '")';
		const datum = generateDatum(index, '', backgroundimage, urls[index]);

		data.push(datum);
	}

	return data;
}

function main() {
	const data = generateData();
	const bubbles = new Bubbles(data);
	const loaderClassList = document.querySelector('.loader').classList;

	bubbles.start().then();
	loaderClassList.add('loader--hide');
}

window.addEventListener('load', main);