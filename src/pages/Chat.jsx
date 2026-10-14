
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import AuthModal from "../components/AuthModal";
import { getCurrentUser, getChatsForUser, addMessageToChat, markMessagesAsRead, getUsers, getProperties, createChat, deleteChat } from "../services/auth";

import chat from "../assets/icons/chat.png"
import "../styles/pages/chat.css";

export default function Chat() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [users, setUsers] = useState({});
  const [properties, setProperties] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setShowAuth(true);
      return;
    }
    setCurrentUser(user);
    loadChats(user.id);
    
    const allUsers = getUsers();
    const usersMap = {};
    allUsers.forEach(u => { usersMap[u.id] = u; });
    setUsers(usersMap);
    
    const allProperties = getProperties();
    const propertiesMap = {};
    allProperties.forEach(p => { propertiesMap[p.id] = p; });
    setProperties(propertiesMap);
  }, []);

  const loadChats = (userId) => {
    const userChats = getChatsForUser(userId);
    userChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    setChats(userChats);
  };

  const deleteSelectedChat = () => {
    if (!selectedChat) return;
    
    if (window.confirm("Вы уверены, что хотите удалить этот чат? Все сообщения будут потеряны.")) {
      deleteChat(selectedChat.id);
      const updatedChats = chats.filter(c => c.id !== selectedChat.id);
      setChats(updatedChats);
      setSelectedChat(null);
      loadChats(currentUser.id);
    }
  };

  useEffect(() => {
    if (selectedChat && currentUser) {
      markMessagesAsRead(selectedChat.id, currentUser.id);
      loadChats(currentUser.id);
    }
  }, [selectedChat, currentUser]);

  useEffect(() => {
    const savedChatId = localStorage.getItem('selectedChatId');
    if (savedChatId && chats.length > 0) {
      const chat = chats.find(c => c.id === parseInt(savedChatId));
      if (chat) {
        setSelectedChat(chat);
        localStorage.removeItem('selectedChatId');
      }
    }
  }, [chats]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !currentUser) return;
    
    const message = {
      text: messageText,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderRole: currentUser.role
    };
    
    const newMessage = addMessageToChat(selectedChat.id, message);
    if (newMessage) {
      setMessageText("");
      const updatedChats = getChatsForUser(currentUser.id);
      const updatedSelectedChat = updatedChats.find(c => c.id === selectedChat.id);
      setSelectedChat(updatedSelectedChat);
      loadChats(currentUser.id);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    const allUsers = getUsers();
    const otherUsers = allUsers.filter(u => u.id !== currentUser?.id);
    
    if (otherUsers.length === 0) {
      alert("Нет других пользователей для чата");
      return;
    }
    
    const userOptions = otherUsers.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      role: u.role
    }));
    
    let message = "Выберите пользователя для чата:\n\n";
    userOptions.forEach((u, index) => {
      message += `${index + 1}. ${u.name} (${u.role === 'realtor' ? 'Риелтор' : 'Пользователь'})\n`;
    });
    message += "\nВведите номер пользователя:";
    
    const choice = prompt(message);
    if (choice) {
      const selectedIndex = parseInt(choice) - 1;
      const targetUser = userOptions[selectedIndex];
      
      if (targetUser) {
        const isRealtor = currentUser.role === 'realtor';
        const newChat = {
          userId: isRealtor ? targetUser.id : currentUser.id,
          realtorId: isRealtor ? currentUser.id : targetUser.id,
          userName: isRealtor ? targetUser.name : `${currentUser.firstName} ${currentUser.lastName}`,
          realtorName: isRealtor ? `${currentUser.firstName} ${currentUser.lastName}` : targetUser.name,
          propertyId: null,
          propertyTitle: null
        };
        
        const chat = createChat(newChat);
        loadChats(currentUser.id);
        setSelectedChat(chat);
      } else {
        alert("Неверный выбор");
      }
    }
  };

  const getOtherUser = (chat) => {
    if (!currentUser) return null;
    const isRealtor = currentUser.role === 'realtor';
    const otherUserId = isRealtor ? chat.userId : chat.realtorId;
    return users[otherUserId];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч`;
    return date.toLocaleDateString();
  };

  if (!currentUser && !showAuth) {
    return (
      <>
        <Header currentUser={null} onAuthClick={() => setShowAuth(true)} onLogout={() => {}} />
        <div className="chat-container">
          <div className="chat-empty">
            <p>Войдите в систему, чтобы начать общение</p>
          </div>
        </div>
      </>
    );
  }

  if (!currentUser) return null;

  return (
    <>
      <Header 
        currentUser={currentUser} 
        onAuthClick={() => setShowAuth(true)} 
        onLogout={() => setCurrentUser(null)}
      />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={(user) => {
        setCurrentUser(user);
        setShowAuth(false);
        loadChats(user.id);
      }} />}
      
      <div className="chat-page">
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>Чаты</h2>
            <button onClick={startNewChat} className="new-chat-btn">
              + Новый чат
            </button>
          </div>
          
          <div className="chat-list">
            {chats.length === 0 ? (
              <div className="no-chats">
                <p>У вас пока нет чатов</p>
                <button onClick={startNewChat}>Начать диалог</button>
              </div>
            ) : (
              chats.map(chat => {
                const otherUser = getOtherUser(chat);
                const unreadCount = chat.unread || 0;
                const lastMessage = chat.lastMessage || "Нет сообщений";
                const lastTime = formatTime(chat.lastMessageTime);
                
                return (
                  <div 
                    key={chat.id} 
                    className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-avatar">
                      {otherUser?.firstName?.[0] || 'U'}
                    </div>
                    <div className="chat-info">
                      <div className="chat-name">
                        {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Пользователь'}
                        {otherUser?.role === 'realtor' && <span className="realtor-badge">Риелтор</span>}
                      </div>
                      <div className="chat-last-message">
                        {lastMessage.length > 40 ? lastMessage.slice(0, 40) + '...' : lastMessage}
                      </div>
                    </div>
                    <div className="chat-meta">
                      <div className="chat-time">{lastTime}</div>
                      {unreadCount > 0 && (
                        <div className="unread-badge">{unreadCount}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <div className="chat-main">
          {!selectedChat ? (
            <div className="chat-empty-state">
              <div className="empty-icon"><img src={chat} alt="" /></div>
              <h3>Выберите чат для начала общения</h3>
              <p>Или начните новый диалог с пользователем или риелтором</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-avatar-large">
                    {getOtherUser(selectedChat)?.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <h3>
                      {getOtherUser(selectedChat)?.firstName} {getOtherUser(selectedChat)?.lastName}
                    </h3>
                    <p className="user-role">
                      {getOtherUser(selectedChat)?.role === 'realtor' ? '🏢 Риелтор' : '👤 Пользователь'}
                    </p>
                  </div>
                </div>
                <button onClick={deleteSelectedChat} className="delete-chat-btn" title="Удалить чат">
                  🗑
                </button>
              </div>
              
              <div className="chat-messages">
                {selectedChat.messages?.map((message, index) => {
                  const isOwn = message.senderId === currentUser.id;
                  return (
                    <div 
                      key={message.id || index} 
                      className={`message ${isOwn ? 'own' : 'other'}`}
                    >
                      <div className="message-bubble">
                        <div className="message-text">{message.text}</div>
                        <div className="message-time">
                          {formatTime(message.timestamp)}
                          {isOwn && message.read && <span className="read-check">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="chat-input-area">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напишите сообщение..."
                  rows="1"
                />
                <button onClick={sendMessage} disabled={!messageText.trim()}>
                  Отправить
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}