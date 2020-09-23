const { CanvasRenderService } = require("chartjs-node-canvas");

module.exports = {
	generatePieChart: async (count, label, width = 800, height = 666) => {
		const configuration = {
			type: "pie",
			data: {
				datasets: [
					{
						data: count,
						backgroundColor: [
							"rgba(241, 51, 097, 0.2)",
							"rgba(101, 142, 255, 0.2)",
							"rgba(255, 206, 86, 0.2)",
							"rgba(75, 192, 192, 0.2)",
							"rgba(153, 102, 255, 0.2)",
						],
						borderColor: [
							"rgba(241, 51, 097, 1)",
							"rgba(101, 142, 255, 1)",
							"rgba(255, 206, 86, 1)",
							"rgba(75, 192, 192, 1)",
							"rgba(153, 102, 255, 1)",
						],
						borderWidth: 2,
					},
				],
				labels: label,
			},
			options: {
				title: {
					display: false,
				},
				cutoutPercentage: 0,
			},
		};
		const chartCallback = (ChartJS) => {
			ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
			ChartJS.defaults.global.defaultFontColor = "white";
		};
		const canvasRenderService = new CanvasRenderService(
			width,
			height,
			chartCallback,
		);
		const image = await canvasRenderService.renderToBuffer(configuration);
		const dataUrl = await canvasRenderService.renderToDataURL(configuration);
		const stream = canvasRenderService.renderToStream(configuration);
		return image;
	},
};
