import { PrismaClient } from "@prisma/client/extension";
import { withAccelerate } from "@prisma/extension-accelerate";

export interface Env {
	DATABASE_URL : string
}

export default {
	async fetch(
		request : Request,
		env : Env,
		ctx : ExecutionContext
	) : Promise<Response> {
		const prisma = new PrismaClient({
			datasourceUrl : env.DATABASE_URL,
		}).$extends(withAccelerate())

		await prisma.log.create({ //putting things in the database //when someone is using outr site then a new log will be created
			data : {
				level : 'Info',
				message : `${request.method} ${request.url}`,
				meta : {
					headers : JSON.stringify(request.headers),
				},
			},
		})

		const {data , info} = await prisma.log //check the logs that any user is there with the same logs or not
			.findMany({
				take : 20,
				orderBy : {
					id : 'desc',
				},
			})
			.withAccelerateInfo()

			console.log(JSON.stringify(info)); //also logging the info 

			return new Response(`request method : ${request.method}!`);
	}
}