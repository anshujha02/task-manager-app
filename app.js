var app = angular.module('taskManagerApp', []);

app.controller('TaskController', function($scope, $http, $filter) {
    $scope.tasks = [];
    $scope.priorities = ['High', 'Medium', 'Low'];

    // Fetch tasks from JSON Server
    $http.get('http://localhost:3000/tasks')
        .then(function(response) {
            $scope.tasks = response.data;
        });

    // Function to add a new task
    $scope.addTask = function() {
        $http.post('http://localhost:3000/tasks', $scope.newTask)
            .then(function(response) {
                $scope.tasks.push(response.data);
                $scope.newTask = {}; // Reset newTask after adding
            })
            .catch(function(error) {
                console.error('Error adding task:', error);
            });
    };
    
    // Function to delete a task
    $scope.deleteTask = function(task) {
        $http.delete('http://localhost:3000/tasks/' + task.id)
            .then(function(response) {
                var index = $scope.tasks.indexOf(task);
                $scope.tasks.splice(index, 1);
            });
    };

    // Function to edit a task
    $scope.editTask = function(task) {
        $scope.editingTask = angular.copy(task);
    };

    // Function to save edited task
    $scope.saveTask = function() {
        $http.put('http://localhost:3000/tasks/' + $scope.editingTask.id, $scope.editingTask)
            .then(function(response) {
                var index = $scope.tasks.findIndex(task => task.id === $scope.editingTask.id);
                $scope.tasks[index] = angular.copy($scope.editingTask);
                $scope.editingTask = null;
            });
    };

    // Cancel editing task
    $scope.cancelEdit = function() {
        $scope.editingTask = null;
    };

    // Function to mark task as completed
    $scope.completeTask = function(task) {
        task.completed = !task.completed;
        $http.put('http://localhost:3000/tasks/' + task.id, task)
            .then(function(response) {
                fetchTasks();
            });
    };

    // Filter tasks based on search, priority, and completion status
    $scope.search = '';
    $scope.priorityFilter = '';
    $scope.completedFilter = false;

    $scope.searchFilter = function(task) {
        var searchText = $scope.search.toLowerCase();
        var nameMatch = !searchText || task.name.toLowerCase().indexOf(searchText) !== -1;
        var priorityMatch = !$scope.priorityFilter || task.priority === $scope.priorityFilter;
        var completedMatch = $scope.completedFilter ? true : !task.completed;
        return nameMatch && priorityMatch && completedMatch;
    };

    // Add notification for tasks with approaching due dates
    $scope.addNotification = function(task) {
        var dueDate = new Date(task.dueDate);
        var now = new Date();
        var timeDiff = dueDate.getTime() - now.getTime();
        if (timeDiff > 0) {
            setTimeout(function() {
                alert('Reminder: Task "' + task.name + '" is due today!');
            }, timeDiff);
        } else {
            alert('Task "' + task.name + '" is already past due date!');
        }
    };
});
