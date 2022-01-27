# nasa-project
This is the final project of the course I am participating in, although I did not create the front end, I did link the backend to the frontend and I do understand how both work.  The frontend was made with react, the server uses (mongo, express and node). It starts with a csv file that is a free resource that nasa gathered about planets and their specifications. Here it uses csv-parse and fs to analyze the planets and puts a few physics creatures to filter out a few that are habitable. After that we push the list of the planets to the database. We also use the spaceX api to get information about their launches since 2006 and we push that data to the db also.   There is also a testing file to test our functions, and we can use postman or the frontend to add new launches and to change from upcoming to canceled.