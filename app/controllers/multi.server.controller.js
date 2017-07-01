module.exports = function(io, socket, current_users) {
	var pointCounter = 0;
	var totalPoints = 100;
	
	var user = {
		id: socket.id,
		name:socket.request.session.name,
		time_entered: Date.now(),
		score: 0,
		ready: false
	};
	current_users.push(user);
	io.emit('new_connection', current_users);

	//Initialize the game by creating a new game board
	var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var secondNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var answers = new Array(10);
    for (var i = 0; i < 10; i++) {
            answers[i] = new Array(10);
        }
        for(var x = 0; x<10; x++){
            for(var y = 0; y< 10; y++){
                answers[x][y] = {answer:((x + 1) * (y+1)), correct:false};
            }
        }
	io.emit('create_table', {answers, current_users});

	//gameON definition
	socket.on('gameON', function(){
		var startCounter = 0;
		//Update current_users with a new ready user
		for(var x = 0; x < current_users.length; x++){
			if(current_users[x].id == socket.id){
				current_users[x].ready = true;
			}
		}	
		for(var x = 0; x < current_users.length; x++){
			if(current_users[x].ready){
				startCounter++;
			}
		}
		if(startCounter >= current_users.length){
		//if all players are marked as ready
			io.emit('gameON', {});
		}
	}); //End gameON()

	//update_table definition
	socket.on('update_table', function(table) {	
		for(var x = 0; x < current_users.length; x++){
			if(current_users[x].id == socket.id){
				current_users[x].score+=1;
			}
		}
		pointCounter++;
		if(pointCounter == totalPoints){
			io.emit('gameOver', current_users);
		}
		table = table;
		io.emit('update_table', {answers:table, current_users:current_users});
	}); //End update_table()
		
        
		
		socket.on('disconnect', function() {
			for (var i = 0; i < current_users.length; i++){
    			if (current_users[i].id === socket.id) { 
        		current_users.splice(i, 1);
       			break;
    		}
		}
			io.emit("new_connection", current_users);
		});
	};