const db = require('../database/dbConfig');

module.exports = {
	add,
	find,
	findBy,
	findById,
	update,
	remove
};

// Create a company
async function add(userId, company) {
	let { email, password, seeker, employer } = await db('users')
		.where({ id: userId })
		.first()
		.returning('id');

	employer = true;

	user = { email, password, seeker, employer };

	await db('users')
		.where({ id: userId })
		.update(user);

	const newCompany = {
		userId,
		...company
	};

	const [id] = await db('companies')
		.insert(newCompany)
		.returning('id');

	return findById(id);
}

// Get all companies
function find() {
	return db('companies');
}

// Get companies by filter
function findBy(filter) {
	return db('companies').where({ filter: filter });
}

// Get company by Id
async function findById(id) {
	const company = await db('companies')
		.where({ id })
		.first();

	const companyJobs = await db('jobs').where({ companyId: id });
	//console.log(companyJobs);
	const mappedJobs = await Promise.all(
		companyJobs.map(async job => {
			const jobSkills = await db('jobs_skills').where({
				jobId: job.id
			});
			//console.log(jobSkills);
			return { ...job, jobSkills };
		})
	);

	const stitchedCompany = {
		...company,
		jobs: mappedJobs
	};
	//console.log(stitchedCompany);
	return stitchedCompany;
}

// Update a company
async function update(id, updated) {
	await db('companies')
		.where({ id })
		.update(updated);

	return findById(id);
}

// Delete a company
function remove(id) {
	return db('companies')
		.where({ id })
		.del();
}
