/**
 * TodoList 类 - 管理待办事项的逻辑
 * 支持添加、删除、完成待办事项，并通过localStorage持久化存储
 */
class TodoList {
    // DOM元素缓存
    #elements = {};
    
    constructor() {
        this.storageKey = 'todos';
        this.todos = this.loadFromStorage();
        this.#cacheElements();
        this.init();
    }

    /**
     * 缓存DOM元素以减少DOM查询
     */
    #cacheElements() {
        this.#elements = {
            addBtn: document.getElementById('addBtn'),
            todoInput: document.getElementById('todoInput'),
            clearBtn: document.getElementById('clearBtn'),
            todoList: document.getElementById('todoList'),
            totalCount: document.getElementById('totalCount'),
            completedCount: document.getElementById('completedCount')
        };
    }

    /**
     * 初始化事件监听
     */
    init() {
        const { addBtn, todoInput, clearBtn } = this.#elements;

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
        clearBtn.addEventListener('click', () => this.clearCompleted());

        this.render();
    }

    /**
     * 添加待办事项
     */
    addTodo() {
        const { todoInput } = this.#elements;
        const text = todoInput.value.trim();

        if (!text) {
            this.#showNotification('请输入待办事项');
            return;
        }

        if (text.length > 200) {
            this.#showNotification('待办事项不能超过200个字符');
            return;
        }

        const todo = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveToStorage();
        this.render();
        todoInput.value = '';
        todoInput.focus();
    }

    /**
     * 切换待办事项的完成状态
     */
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    /**
     * 删除待办事项
     */
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToStorage();
        this.render();
    }

    /**
     * 清空已完成的待办事项
     */
    clearCompleted() {
        const completed = this.todos.filter(t => t.completed);
        
        if (completed.length === 0) {
            this.#showNotification('没有已完成的待办事项');
            return;
        }

        if (this.#confirm(`确定要删除 ${completed.length} 个已完成的待办事项吗?`)) {
    /**
     * 渲染DOM
     */
    render() {
        const { todoList, totalCount, completedCount } = this.#elements;

        todoList.innerHTML = '';

        if (this.todos.length === 0) {
            todoList.innerHTML = '<div class="empty-state">暂无待办事项，添加一个吧！</div>';
            this.#updateStats(0, 0);
            return;
        }

        this.todos.forEach(todo => {
            const li = this.#createTodoElement(todo);
            todoList.appendChild(li);
        });

        const completed = this.todos.filter(t => t.completed).length;
        this.#updateStats(this.todos.length, completed);
    }

    /**
     * 创建待办事项元素
     */
    #createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                data-id="${todo.id}"
                aria-label="完成待办事项"
            >
            <span class="todo-text">${this.#escapeHtml(todo.text)}</span>
            <button class="delete-btn" data-id="${todo.id}" aria-label="删除待办事项">删除</button>
        `;

        const checkbox = li.querySelector('.todo-checkbox');
        const deleteBtn = li.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        return li;
    /**
     * 保存到localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
        } catch (error) {
            console.error('存储保存失败:', error);
            this.#showNotification('保存失败，请检查浏览器存储');
        }
    }

    /**
     * 从localStorage加载数据
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
/**
 * 应用入口 - 页面加载完成后初始化应用
 */
document.addEventListener('DOMContentLoaded', () => {
    new TodoList();
});     }
    }

    /**
     * HTML转义 - 防止XSS
     */
    #escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * 显示通知
     */
    #showNotification(message) {
        alert(message);
    }

    /**
     * 显示确认对话框
     */
    #confirm(message) {
        return confirm(message);
    }
}   // 保存到 localStorage
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
