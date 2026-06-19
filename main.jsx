import { useState } from "react";

const SPICE_EMOJI = ["🌶️", "🧄", "🧅", "🫚", "🌿", "🍅"];

function SpiceTag({ label, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      background: "#FFF3E0", border: "1px solid #FF8F00",
      color: "#E65100", borderRadius: "20px",
      padding: "4px 12px", fontSize: "13px", fontWeight: 500
    }}>
      {label}
      <button onClick={onRemove} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "#E65100", fontSize: "15px", lineHeight: 1, padding: 0
      }}>×</button>
    </span>
  );
}

export default function RecipeGenerator() {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addIngredient = () => {
    const val = input.trim();
    if (val && !ingredients.includes(val)) {
      setIngredients([...ingredients, val]);
    }
    setInput("");
  };

  const removeIngredient = (i) => {
    setIngredients(ingredients.filter((_, idx) => idx !== i));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      setError("Pehle kuch ingredients daalo!");
      return;
    }
    setError("");
    setLoading(true);
    setRecipe(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `Tum ek expert Pakistani chef ho. User jo ingredients dega, unse ek delicious Pakistani/Desi recipe banao.
Response SIRF is JSON format mein do, koi extra text nahi:
{
  "name": "Recipe ka naam (Urdu/English mein)",
  "time": "Total cooking time",
  "servings": "Kitne logo ke liye",
  "difficulty": "Aasaan / Medium / Mushkil",
  "description": "2 line mein recipe ki description",
  "extraIngredients": ["Jo ingredients user ke paas nahi hain unki list"],
  "steps": ["Step 1...", "Step 2...", "Step 3..."],
  "tip": "Ek chef tip"
}`,
          messages: [{
            role: "user",
            content: `Mere paas yeh ingredients hain: ${ingredients.join(", ")}. Ek achhi recipe batao.`
          }]
        })
      });

      const data = await response.json();
      const text = data.content.map(i => i.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setRecipe(parsed);
    } catch (err) {
      setError("Kuch masla ho gaya! Dobara try karo.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: "24px 16px"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "48px", marginBottom: "8px" }}>🍛</div>
        <h1 style={{
          color: "#FFD54F", fontSize: "28px", fontWeight: 800,
          margin: 0, letterSpacing: "-0.5px"
        }}>
          AI Recipe Generator
        </h1>
        <p style={{ color: "#FFCC02", opacity: 0.7, marginTop: "6px", fontSize: "14px" }}>
          Ingredients daalo — recipe milegi ✨
        </p>
      </div>

      {/* Main Card */}
      <div style={{
        maxWidth: "560px", margin: "0 auto",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,213,79,0.2)",
        borderRadius: "20px", padding: "24px",
        backdropFilter: "blur(10px)"
      }}>

        {/* Input */}
        <label style={{ color: "#FFD54F", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
          🥗 Ingredients Likho
        </label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addIngredient()}
            placeholder="jaise: chicken, pyaz, tamatar..."
            style={{
              flex: 1, padding: "12px 16px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,213,79,0.3)",
              borderRadius: "12px", color: "#fff",
              fontSize: "14px", outline: "none"
            }}
          />
          <button onClick={addIngredient} style={{
            background: "#FF8F00", color: "#fff",
            border: "none", borderRadius: "12px",
            padding: "12px 18px", cursor: "pointer",
            fontSize: "20px", fontWeight: 700
          }}>+</button>
        </div>

        {/* Tags */}
        {ingredients.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            {ingredients.map((ing, i) => (
              <SpiceTag key={i} label={ing} onRemove={() => removeIngredient(i)} />
            ))}
          </div>
        )}

        {/* Floating spice hints */}
        {ingredients.length === 0 && (
          <div style={{ color: "rgba(255,213,79,0.4)", fontSize: "12px", marginBottom: "16px" }}>
            {SPICE_EMOJI.map((e, i) => <span key={i} style={{ marginRight: "6px" }}>{e}</span>)}
            <span>jo ghar mein ho woh likho...</span>
          </div>
        )}

        {error && (
          <p style={{ color: "#FF5252", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
        )}

        {/* Generate Button */}
        <button
          onClick={generateRecipe}
          disabled={loading}
          style={{
            width: "100%", padding: "14px",
            background: loading ? "rgba(255,143,0,0.4)" : "linear-gradient(135deg, #FF8F00, #FF6D00)",
            color: "#fff", border: "none", borderRadius: "14px",
            fontSize: "16px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s", letterSpacing: "0.3px"
          }}
        >
          {loading ? "🍳 Recipe ban rahi hai..." : "✨ Recipe Banao!"}
        </button>
      </div>

      {/* Recipe Result */}
      {recipe && (
        <div style={{
          maxWidth: "560px", margin: "24px auto 0",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,213,79,0.25)",
          borderRadius: "20px", padding: "24px",
          backdropFilter: "blur(10px)"
        }}>
          {/* Recipe Header */}
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ color: "#FFD54F", fontSize: "22px", fontWeight: 800, margin: "0 0 6px" }}>
              🍽️ {recipe.name}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", margin: "0 0 14px" }}>
              {recipe.description}
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                { icon: "⏱️", val: recipe.time },
                { icon: "👥", val: recipe.servings },
                { icon: "📊", val: recipe.difficulty }
              ].map((m, i) => (
                <span key={i} style={{
                  background: "rgba(255,213,79,0.1)", border: "1px solid rgba(255,213,79,0.2)",
                  color: "#FFD54F", borderRadius: "10px", padding: "4px 12px", fontSize: "12px"
                }}>
                  {m.icon} {m.val}
                </span>
              ))}
            </div>
          </div>

          {/* Extra Ingredients */}
          {recipe.extraIngredients?.length > 0 && (
            <div style={{
              background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.2)",
              borderRadius: "12px", padding: "12px 16px", marginBottom: "20px"
            }}>
              <p style={{ color: "#FF5252", fontWeight: 600, fontSize: "13px", margin: "0 0 6px" }}>
                🛒 Yeh bhi chahiye honge:
              </p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", margin: 0 }}>
                {recipe.extraIngredients.join(", ")}
              </p>
            </div>
          )}

          {/* Steps */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ color: "#FFD54F", fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>
              👨‍🍳 TARIKA
            </h3>
            {recipe.steps?.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <span style={{
                  minWidth: "26px", height: "26px", background: "#FF8F00",
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700
                }}>{i + 1}</span>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* Tip */}
          {recipe.tip && (
            <div style={{
              background: "rgba(255,213,79,0.08)", border: "1px solid rgba(255,213,79,0.2)",
              borderRadius: "12px", padding: "12px 16px"
            }}>
              <p style={{ color: "#FFD54F", fontWeight: 600, fontSize: "13px", margin: "0 0 4px" }}>
                💡 Chef Tip
              </p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", margin: 0 }}>
                {recipe.tip}
              </p>
            </div>
          )}

          {/* Try Again */}
          <button onClick={() => { setRecipe(null); setIngredients([]); }} style={{
            width: "100%", marginTop: "20px", padding: "12px",
            background: "transparent", border: "1px solid rgba(255,213,79,0.3)",
            color: "#FFD54F", borderRadius: "12px", fontSize: "14px",
            cursor: "pointer", fontWeight: 600
          }}>
            🔄 Nayi Recipe Try Karo
          </button>
        </div>
      )}
    </div>
  );
}
