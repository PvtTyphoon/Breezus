const Chart = require("chart.js");
const { CanvasRenderService } = require("chartjs-node-canvas");

module.exports = {
	generateBarChart: async (
		count,
		label,
		scrobbleLabel,
		width = 2000,
		height = 1500,
	) => {
		const configuration = {
			type: "bar",
			data: {
				datasets: [
					{
						label: scrobbleLabel.join("\n"),
						data: count,
						backgroundColor: [
							"rgba(101, 142, 255, 0.2)",
							"rgba(227, 11, 93, 0.2)",
							"rgba(176, 235, 255,0.2)",
							"rgba(255, 206, 86, 0.2)",
							"rgba(75, 192, 192, 0.2)",
							"rgba(153, 102, 255, 0.2)",
							"rgba(255, 99, 132, 0.2)",
							"rgba(54, 162, 235, 0.2)",
							"rgba(255, 206, 86, 0.2)",
							"rgba(75, 192, 192, 0.2)",
							"rgba(153, 102, 255, 0.2)",
							"rgba(255, 159, 64, 0.2)",
							"rgba(255, 99, 132, 0.2)",
							"rgba(54, 162, 235, 0.2)",
							"rgba(255, 206, 86, 0.2)",
							"rgba(75, 192, 192, 0.2)",
							"rgba(153, 102, 255, 0.2)",
							"rgba(255, 159, 64, 0.2)",
							"rgba(255, 99, 132, 0.2)",
							"rgba(54, 162, 235, 0.2)",
							"rgba(255, 206, 86, 0.2)",
							"rgba(255, 251, 15, 0.2)",
							"rgba(136, 172, 196, 0.2)",
							"rgba(220, 179, 215, 0.2)",
						],
						borderColor: [
							"rgba(101, 142, 255, 1)",
							"rgba(227, 11, 93, 1)",
							"rgba(176, 235, 255,1)",
							"rgba(255, 206, 86, 1)",
							"rgba(75, 192, 192, 1)",
							"rgba(153, 102, 255, 1)",
							"rgba(255, 99, 132, 1)",
							"rgba(54, 162, 235, 1)",
							"rgba(255, 206, 86, 1)",
							"rgba(75, 192, 192, 1)",
							"rgba(153, 102, 255,1)",
							"rgba(255, 159, 64, 1)",
							"rgba(255, 99, 132, 1)",
							"rgba(54, 162, 235, 1)",
							"rgba(255, 206, 86, 1)",
							"rgba(75, 192, 192, 1)",
							"rgba(153, 102, 255, 1)",
							"rgba(255, 159, 64, 1)",
							"rgba(255, 99, 132, 1)",
							"rgba(54, 162, 235, 1)",
							"rgba(255, 206, 86, 1)",
							"rgba(255, 251, 15, 1)",
							"rgba(136, 172, 196, 1)",
							"rgba(220, 179, 215, 1)",
						],
						borderWidth: 2,
					},
				],
				labels: label,
			},
			options: {
				scales: {
					yAxes: [
						{
							ticks: {
								beginAtZero: true,
								callback: (value) => value + " Scrobbles",
							},
						},
					],
				},
			},
		};
		const chartCallback = (ChartJS) => {
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
