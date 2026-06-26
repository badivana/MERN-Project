const Task = require("../models/Task");

// Get all tasks (with filtering, searching, sorting)
exports.getTasks = async (req, res) => {
    try {
        const { status, priority, category, search, sortBy } = req.query;
        let query = { user: req.user.id };

        // Apply filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;

        // Apply search query
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // Build sorting
        let sortOption = { createdAt: -1 }; // Default
        if (sortBy === "dueDate") {
            sortOption = { dueDate: 1 };
        } else if (sortBy === "priority") {
            sortOption = { priority: -1 };
        }

        const tasks = await Task.find(query).sort(sortOption);
        res.json(tasks);
    } catch (err) {
        console.error("getTasks error:", err);
        res.status(500).json({ message: "Server error fetching tasks" });
    }
};

// Create a task
exports.createTask = async (req, res) => {
    try {
        const { title, description, status, priority, category, dueDate, subtasks } = req.body;
        
        if (!title) {
            return res.status(400).json({ message: "Task title is required" });
        }

        const newTask = new Task({
            title,
            description,
            status: status || "Todo",
            priority: priority || "Medium",
            category: category || "Work",
            dueDate: dueDate || null,
            subtasks: subtasks || [],
            user: req.user.id
        });

        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        console.error("createTask error:", err);
        res.status(500).json({ message: "Server error creating task" });
    }
};

// Update a task
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, category, dueDate, subtasks } = req.body;

        const task = await Task.findOne({ _id: id, user: req.user.id });
        if (!task) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (category !== undefined) task.category = category;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (subtasks !== undefined) task.subtasks = subtasks;

        await task.save();
        res.json(task);
    } catch (err) {
        console.error("updateTask error:", err);
        res.status(500).json({ message: "Server error updating task" });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Task.findOneAndDelete({ _id: id, user: req.user.id });
        
        if (!result) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        console.error("deleteTask error:", err);
        res.status(500).json({ message: "Server error deleting task" });
    }
};

// Get Dashboard and Analytics metrics (including advanced productivity calculations)
exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const allTasks = await Task.find({ user: userId });

        // Calculate counts
        const total = allTasks.length;
        const counts = { Todo: 0, InProgress: 0, InReview: 0, Done: 0 };
        const priorities = { Low: 0, Medium: 0, High: 0 };
        const categories = { Work: 0, Personal: 0, Design: 0, Development: 0 };

        let completedSubtasks = 0;
        let totalSubtasks = 0;
        let highPriorityCompleted = 0;

        allTasks.forEach(task => {
            if (counts[task.status] !== undefined) counts[task.status]++;
            if (priorities[task.priority] !== undefined) priorities[task.priority]++;
            if (categories[task.category] !== undefined) categories[task.category]++;

            // Subtask totals
            if (task.subtasks && task.subtasks.length > 0) {
                totalSubtasks += task.subtasks.length;
                completedSubtasks += task.subtasks.filter(sub => sub.completed).length;
            }

            if (task.status === "Done" && task.priority === "High") {
                highPriorityCompleted++;
            }
        });

        // Compute 7 days task completion trend
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklyTrend = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = daysOfWeek[date.getDay()];
            const dayString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const count = allTasks.filter(task => {
                if (task.status !== "Done") return false;
                const taskDate = new Date(task.dueDate || task.createdAt);
                return taskDate.toDateString() === date.toDateString();
            }).length;

            weeklyTrend.push({
                day: dayName,
                date: dayString,
                completed: count
            });
        }

        // Compute a cosmic "Productivity Score" (0 to 100)
        // Score = (DoneTasks / TotalTasks) * 60 + (CompletedSubtasks / TotalSubtasks) * 20 + (HighPriorityCompleted * 10)
        // Cap it at 100. If no tasks, score is 0.
        let productivityScore = 0;
        if (total > 0) {
            const completionRatio = counts.Done / total;
            const subtaskRatio = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) : 1;
            
            productivityScore = Math.round(
                (completionRatio * 60) + 
                (subtaskRatio * 20) + 
                (Math.min(highPriorityCompleted, 2) * 10)
            );
            productivityScore = Math.min(100, Math.max(0, productivityScore));
        }

        res.json({
            total,
            counts,
            priorities,
            categories,
            weeklyTrend,
            productivityScore,
            subtaskStats: {
                total: totalSubtasks,
                completed: completedSubtasks
            }
        });
    } catch (err) {
        console.error("getAnalytics error:", err);
        res.status(500).json({ message: "Server error calculating analytics" });
    }
};
