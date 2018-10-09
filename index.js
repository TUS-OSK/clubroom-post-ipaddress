const Twitter = require("twitter")
const token = require("./token.js")
const promisify = require("util").promisify
const exec = promisify(require("child_process").exec)

const client = new Twitter(token)

const prevIPfile = "./prev-ip.txt"

async function interval() {
	const previp = (await exec(`cat prev-ip.txt | tail -n +2`)).stdout.trim()
	// console.log((await exec(`ifconfig`)).stdout)
	const ip = (await exec(`ifconfig | grep -o 'inet \\d\\+\\.\\d\\+\\.\\d\\+\\.\\d\\+' | sed "s/inet //"`)).stdout.trim()
	if(previp !== ip) {
		await exec(`echo '${ date() }' > ${ prevIPfile }`)
		await exec(`echo '${ ip }' >> ${ prevIPfile }`)

		const status = `${ ip }`
		await tweet(status)
	}
	// await tweet("てすと").catch(err => { console.error(err) })
}

interval()

function tweet(status) {
	return new Promise((resolve, reject) => {
		client.post("statuses/update", {
				status
			}, (err, params, res) => {
				if(err) reject(err)
				resolve(res)
			}
		)
	})
}

function date() {
	const now = new Date()
	const digAdj = (num, dig) => { return (Array(dig - 1).fill("0").join("") + num).split("").slice(-1 * dig).join("") }
	return `${ now.getFullYear() }/${ digAdj(now.getMonth() + 1, 2) }/${ digAdj(now.getDate(), 2) } ${ digAdj(now.getHours(), 2) }:${ digAdj(now.getMinutes(), 2) }:${ digAdj(now.getSeconds(), 2) }`
}
