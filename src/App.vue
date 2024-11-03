<template>
  <div class="container">
    <header>
      <h1>Customer Service Assistant</h1>
    </header>

    <div class="chat-container">
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.type]"
        >
          <div class="message-content">{{ message.text }}</div>
        </div>
      </div>

      <div class="input-container">
        <textarea
          v-model="userInput"
          @keyup.enter.exact.prevent="sendMessage"
          placeholder="Type your question here..."
          :disabled="loading"
        ></textarea>
        <button @click="sendMessage" :disabled="loading || !userInput.trim()">
          {{ loading ? "Sending..." : "Send" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      messages: [],
      userInput: "",
      loading: false,
    };
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim() || this.loading) return;

      const userMessage = this.userInput.trim();
      this.messages.push({ type: "user", text: userMessage });
      this.userInput = "";
      this.loading = true;

      try {
        const response = await fetch("http://localhost:3000/api/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: userMessage }),
        });

        const data = await response.json();

        if (response.ok) {
          this.messages.push({ type: "assistant", text: data.response });
        } else {
          throw new Error(data.error || "Failed to get response");
        }
      } catch (error) {
        console.error("Error:", error);
        this.messages.push({
          type: "error",
          text: "Sorry, there was an error processing your request.",
        });
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },
  },
};
</script>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

h1 {
  color: #2c3e50;
}

.chat-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 15px;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
}

.message-content {
  padding: 10px 15px;
  border-radius: 15px;
  display: inline-block;
}

.user .message-content {
  background: #007bff;
  color: white;
}

.assistant .message-content {
  background: #f1f1f1;
  color: #333;
}

.error .message-content {
  background: #dc3545;
  color: white;
}

.input-container {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  height: 40px;
  font-family: inherit;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
