// TodoList 类 - 管理待办事项的逻辑
class TodoList {
    constructor() {
        this.storageKey = 'todos';
        this.todos = this.loadFromStorage();
        this.init();
    }

    // 初始化事件监听
    init() {
        const addBtn = document.getElementById('addBtn');
        const todoInput = document.getElementById('todoInput');
        const clearBtn = document.getElementById('clearBtn');

        // 添加待办事项
        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // 清空已完成的待办事项
        clearBtn.addEventListener('click', () => this.clearCompleted());

        // 初始化渲染
        this.render();
    }

    // 添加待办事项
    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (!text) {
            alert('请输入待办事项');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveToStorage();
        this.render();
        input.value = '';
        input.focus();
    }

    // 切换待办事项的完成状态
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    // 删除待办事项
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToStorage();
        this.render();
    }

    // 清空已完成的待办事项
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            alert('没有已完成的待办事项');
            return;
        }

        if (confirm(`确定要删除 ${completedCount} 个已完成的待办事项吗?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveToStorage();
            this.render();
        }
    }

    // 渲染 DOM
    render() {
        const todoList = document.getElementById('todoList');
        const totalCount = document.getElementById('totalCount');
        const completedCount = document.getElementById('completedCount');

        // 清空列表
        todoList.innerHTML = '';

        if (this.todos.length === 0) {
            todoList.innerHTML = '<div class="empty-state">暂无待办事项，添加一个吧！</div>';
            totalCount.textContent = '总数: 0';
            completedCount.textContent = '已完成: 0';
            return;
        }

        // 渲染每个待办事项
        this.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    data-id="${todo.id}"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="delete-btn" data-id="${todo.id}">删除</button>
            `;

            // 勾选完成事件
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

            // 删除按钮事件
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

            todoList.appendChild(li);
        });

        // 更新统计信息
        const completed = this.todos.filter(t => t.completed).length;
        totalCount.textContent = `总数: ${this.todos.length}`;
        completedCount.textContent = `已完成: ${completed}`;
    }

    // 保存到 localStorage
    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
    }

    // 从 localStorage 加载
    loadFromStorage() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // HTML 转义 - 防止 XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoList();
});
