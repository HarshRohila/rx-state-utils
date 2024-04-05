interface Todo {
  text: string
  id: string
}

function TodoCreator() {
  let count = 0

  return {
    createTodo(todo: Partial<Todo>): Todo {
      return {
        id: (++count).toString(),
        text: todo.text || '',
      }
    },
  }
}

export { Todo, TodoCreator }
