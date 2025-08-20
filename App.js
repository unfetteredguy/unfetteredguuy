import React, { useState, useEffect } from 'react';

// === DATA STRUCTURES ===

// Node class for the doubly linked list
class Node {
  constructor(book) {
    this.book = book;
    this.next = null;
    this.prev = null;
  }
}

// Doubly Linked List for the book inventory
class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  // Adds a new book to the end of the list
  addBook(book) {
    const newNode = new Node(book);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    this.size++;
  }

  // Finds a book by title
  findBookByTitle(title) {
    let current = this.head;
    while (current) {
      if (current.book.title.toLowerCase() === title.toLowerCase()) {
        return current.book;
      }
      current = current.next;
    }
    return null;
  }

  // Traverses the list and returns an array of all books
  getAllBooks() {
    const books = [];
    let current = this.head;
    while (current) {
      books.push(current.book);
      current = current.next;
    }
    return books;
  }

  // Searches for books by title or author and returns a new array
  search(query) {
    const results = [];
    const lowerCaseQuery = query.toLowerCase();
    let current = this.head;
    while (current) {
      if (
        current.book.title.toLowerCase().includes(lowerCaseQuery) ||
        current.book.author.toLowerCase().includes(lowerCaseQuery)
      ) {
        results.push(current.book);
      }
      current = current.next;
    }
    return results;
  }
}

// Stack for undo actions (LIFO - Last-In, First-Out)
class Stack {
  constructor() {
    this.items = [];
  }

  // Pushes a new item onto the stack
  push(item) {
    this.items.push(item);
  }

  // Removes and returns the top item from the stack
  pop() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.pop();
  }

  // Checks if the stack is empty
  isEmpty() {
    return this.items.length === 0;
  }
}

// === REACT COMPONENT ===
const App = () => {
  // State for the library inventory and undo stack
  const [inventory, setInventory] = useState(new LinkedList());
  const [undoStack, setUndoStack] = useState(new Stack());
  const [booksToDisplay, setBooksToDisplay] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [message, setMessage] = useState('');

  // Effect to initialize the app with sample data on first render
  useEffect(() => {
    const initialInventory = new LinkedList();
    initialInventory.addBook({ title: 'To Kill a Mockingbird', author: 'Harper Lee', isAvailable: true });
    initialInventory.addBook({ title: '1984', author: 'George Orwell', isAvailable: true });
    initialInventory.addBook({ title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isAvailable: false });
    initialInventory.addBook({ title: 'Moby Dick', author: 'Herman Melville', isAvailable: true });

    setInventory(initialInventory);
    setBooksToDisplay(initialInventory.getAllBooks());
  }, []);

  // Function to handle borrowing a book
  const handleBorrow = (bookToBorrow) => {
    // Find the book in the linked list and update its status
    const book = inventory.findBookByTitle(bookToBorrow.title);
    if (book && book.isAvailable) {
      book.isAvailable = false;
      // Push the action onto the undo stack
      const newStack = new Stack();
      newStack.items = [...undoStack.items, { action: 'borrow', book: bookToBorrow }];
      setUndoStack(newStack);
      // Update the display list and show a success message
      setBooksToDisplay([...inventory.getAllBooks()]);
      setMessage(`"${book.title}" has been successfully borrowed.`);
    } else {
      setMessage(`"${bookToBorrow.title}" is not available for borrowing.`);
    }
  };

  // Function to handle returning a book
  const handleReturn = (bookToReturn) => {
    // Find the book and update its status
    const book = inventory.findBookByTitle(bookToReturn.title);
    if (book && !book.isAvailable) {
      book.isAvailable = true;
      // Push the action onto the undo stack
      const newStack = new Stack();
      newStack.items = [...undoStack.items, { action: 'return', book: bookToReturn }];
      setUndoStack(newStack);
      // Update the display list and show a success message
      setBooksToDisplay([...inventory.getAllBooks()]);
      setMessage(`"${book.title}" has been successfully returned.`);
    } else {
      setMessage(`"${bookToReturn.title}" cannot be returned.`);
    }
  };

  // Function to undo the last action
  const handleUndo = () => {
    if (undoStack.isEmpty()) {
      setMessage('No actions to undo.');
      return;
    }

    // Pop the last action from the stack
    const lastAction = undoStack.pop();
    const newStack = new Stack();
    newStack.items = [...undoStack.items];
    setUndoStack(newStack);

    // Reverse the action on the book
    const book = inventory.findBookByTitle(lastAction.book.title);
    if (book) {
      if (lastAction.action === 'borrow') {
        book.isAvailable = true;
        setMessage(`Undo successful: "${book.title}" is now available.`);
      } else if (lastAction.action === 'return') {
        book.isAvailable = false;
        setMessage(`Undo successful: "${book.title}" is now borrowed.`);
      }
      // Update the display list
      setBooksToDisplay([...inventory.getAllBooks()]);
    }
  };

  // Function to handle adding a new book
  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newBookTitle || !newBookAuthor) {
      setMessage('Please enter both a title and an author for the new book.');
      return;
    }
    const newBook = {
      title: newBookTitle,
      author: newBookAuthor,
      isAvailable: true,
    };
    inventory.addBook(newBook);
    setBooksToDisplay([...inventory.getAllBooks()]);
    setNewBookTitle('');
    setNewBookAuthor('');
    setMessage(`"${newBook.title}" by ${newBook.author} has been added to the library!`);
  };

  // Function to handle the search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === '') {
      setMessage('Please enter a search term.');
      return;
    }
    const results = inventory.search(searchTerm);
    setBooksToDisplay(results);
    setMessage(`Found ${results.length} book(s) matching your search.`);
  };

  // Function to reset the search and show all books
  const handleResetSearch = () => {
    setSearchTerm('');
    setBooksToDisplay([...inventory.getAllBooks()]);
    setMessage('Showing all books.');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-inter">
      <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">E-Library Book Management 📚</h1>

        {/* Message Display */}
        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-xl mb-6 text-center">
            {message}
          </div>
        )}

        {/* Add Book Form */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Add a New Book</h2>
          <form onSubmit={handleAddBook} className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <input
              type="text"
              placeholder="Book Title"
              value={newBookTitle}
              onChange={(e) => setNewBookTitle(e.target.value)}
              className="p-3 flex-grow rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Author"
              value={newBookAuthor}
              onChange={(e) => setNewBookAuthor(e.target.value)}
              className="p-3 flex-grow rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:bg-green-700 transition duration-300 ease-in-out"
            >
              Add Book
            </button>
          </form>
        </div>
        
        {/* Action and Search Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <form onSubmit={handleSearch} className="flex-grow w-full md:w-auto flex space-x-2">
            <input
              type="text"
              className="flex-grow p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleResetSearch}
              className="bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl shadow-md hover:bg-gray-300 transition duration-300 ease-in-out"
            >
              Reset
            </button>
          </form>
          <button
            onClick={handleUndo}
            disabled={undoStack.isEmpty()}
            className={`bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-300 ease-in-out ${undoStack.isEmpty() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
          >
            ⏪ Undo
          </button>
        </div>

        {/* Book List */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Book Inventory</h2>
          {booksToDisplay.length > 0 ? (
            <div className="space-y-4">
              {booksToDisplay.map((book, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md transition-transform transform hover:scale-[1.01] border border-gray-200"
                >
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-800">{book.title}</span>
                    <span className="text-sm text-gray-500">by {book.author}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`font-semibold px-3 py-1 rounded-full text-xs ${
                        book.isAvailable
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {book.isAvailable ? 'Available' : 'Borrowed'}
                    </span>
                    {book.isAvailable ? (
                      <button
                        onClick={() => handleBorrow(book)}
                        className="bg-green-500 text-white font-semibold py-2 px-4 rounded-xl hover:bg-green-600 transition duration-300 ease-in-out shadow-lg"
                      >
                        Borrow
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReturn(book)}
                        className="bg-red-500 text-white font-semibold py-2 px-4 rounded-xl hover:bg-red-600 transition duration-300 ease-in-out shadow-lg"
                      >
                        Return
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 p-8">
              No books found. Try adding some books or resetting the search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
