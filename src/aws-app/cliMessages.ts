import {blueBright, yellowBright} from 'colorette'

export const getIntro = () => `

--

${blueBright(`Welcome to Cloud Data Import Tool by Miro! 🌥️✨`)}

Use this tool to extract your cloud resources securely in your own machine and save them as a JSON file. Then import the exported JSON into a Miro board for seamless visualization and optimization.

💻 Find the source-code and full documentation at ${yellowBright('https://github.com/miroapp/cloud-data-import')}

🔧 In case you face any issues, please report them at ${yellowBright(
	'https://github.com/miroapp/cloud-data-import/issues',
)}

--

`

export const getOutro = ({pathname, duration, count}: {pathname: string; duration: number; count: number}) => `

--

${blueBright(`Resource discovery completed successfully! 🚀`)}

🕑 It took ${duration}s to discover ${count} resources.

📦 Your resources are saved at ${yellowBright(
	pathname,
)}. Now it's time to open a Miro board, navigate to Diagramming Library via toolbar and click on import button to import this file.

Happy visualizing!

`
