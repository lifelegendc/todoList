/**
 * TodoList 类 - 管理待办事项的逻辑
 * 支持添加、删除、完成待办事项，并通过localStorage持久化存储
 * test 1210
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
     * 编辑待办事项
     */
    editTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.saveToStorage();
            this.render();
        }
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
            this.todos = this.todos.filter(t => !t.completed);
            this.saveToStorage();
            this.render();
        }
    }

    /**
     * 更新统计信息
     */
    #updateStats(total, completed) {
        const { totalCount, completedCount } = this.#elements;
        totalCount.textContent = `总数: ${total}`;
        completedCount.textContent = `已完成: ${completed}`;
    }

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
            <button class="edit-btn" data-id="${todo.id}" aria-label="编辑待办事项">编辑</button>
            <button class="delete-btn" data-id="${todo.id}" aria-label="删除待办事项">删除</button>
        `;

        const checkbox = li.querySelector('.todo-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
        editBtn.addEventListener('click', () => this.#handleEdit(todo.id, todo.text));
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        return li;
    }

    /**
     * 处理编辑操作
     */
    #handleEdit(id, currentText) {
        const newText = prompt('编辑待办事项:', currentText);
        if (newText !== null) {
            this.editTodo(id, newText);
        }
    }

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
        } catch (error) {
            console.error('存储加载失败:', error);
            this.#showNotification('数据加载失败');
            return [];
        }
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
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoList();
});