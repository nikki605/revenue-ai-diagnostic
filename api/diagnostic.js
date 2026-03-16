<script>
  const form = document.getElementById("rf-form");
  const input = document.getElementById("rf-input");
  const messages = document.getElementById("rf-messages");

  function setMessage(text) {
    messages.textContent = text;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const question = input.value.trim();
    if (!question) {
      setMessage("Please describe what feels broken in your growth system.");
      return;
    }

    setMessage("Thinking...");

    try {
      const response = await fetch("https://revenue-ai-diagnostic.vercel.app/api/diagnostic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong connecting to the diagnostic engine.");
        console.error("Backend error:", data);
        return;
      }

      setMessage(data.answer || "The diagnostic engine returned an empty response.");
    } catch (error) {
      setMessage("Something went wrong connecting to the diagnostic engine.");
      console.error(error);
    }
  });
</script>
