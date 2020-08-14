import * as cytoscape from 'cytoscape';
import { ElementDefinition, LayoutOptions } from 'cytoscape';
import { Vertex } from "sodiumjs";

export function showGraph() {
	const elements = Vertex.all.flatMap((v) => {
		const dependents = v.dependents ?? new Set();
		const edges = [...dependents].map<ElementDefinition>((d) =>
			({
				group: 'edges',
				data: {
					id: `${v.id}-${d.id}`,
					source: `${v.id}`,
					target: `${d.id}`
				}
			})
		);
		const typeName = v.typeName !== undefined ? `<${v.typeName}>` : "";
		const vertexType = `${v.constructor.name}${typeName}`;
		return [
			<ElementDefinition>{
				group: 'nodes',
				data: {
					id: `${v.id}`,
					vertexType: vertexType,
				}
			},
			...edges,
		]
	});

	const cy = cytoscape({
		container: document.getElementById('cy'),

		// ready: function(){
		// 	this.nodes().forEach(function(node){
		// 		let width = [30, 70, 110];
		// 		let size = width[Math.floor(Math.random()*3)];
		// 		node.css("width", size);
		// 		node.css("height", size);
		// 	});
		// 	this.layout({name: 'cose-bilkent', animationDuration: 1000}).run();
		// },

		layout: {
			name: 'cose-bilkent',
			idealEdgeLength: 100,
		} as LayoutOptions,

		style: [
			{
				selector: 'node',
				style: {
					'background-color': '#ad1a66',
					'content': 'data(vertexType)',
				}
			},
			{
				selector: ':parent',
				style: {
					'background-opacity': 0.333
				}
			},
			{
				selector: 'edge',
				style: {
					'width': 3,
					'line-color': '#ad1a66',
					'target-arrow-color': '#ad1a66',
					'curve-style': 'bezier',
					'target-arrow-shape': 'triangle',
				}
			},
			{
				"selector": "edge.hollow",
				"style": {
					"target-arrow-fill": "hollow"
				}
			}
		],

		elements: elements,
	});
}
