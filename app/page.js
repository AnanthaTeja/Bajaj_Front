"use client";
import { useState } from "react";
import axios from "axios";
import Select from "react-select";

function App() {
  const [jsonInput, setJsonInput] = useState('{"data": ["A","C","z"]}');
  const [fileInput, setFileInput] = useState(null);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFileInput(e.target.files[0]);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const parsedInput = JSON.parse(jsonInput);
      if (!Array.isArray(parsedInput.data)) {
        throw new Error("Invalid input format. 'data' should be an array.");
      }
      setError("");

      // Prepare FormData to send JSON and file together
      const formData = new FormData();
      formData.append("data", JSON.stringify(parsedInput.data));
      if (fileInput) {
        formData.append("file", fileInput);
      }

      const apiResponse = await axios.post(
        // "http://localhost:3000/bfhl",
        "https://bajaj-bfhs-end.onrender.com/bfhl",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResponse(apiResponse.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response) {
          setError(
            `Server error: ${e.response.status} ${e.response.statusText}`
          );
        } else if (e.request) {
          setError(
            "No response received from server. Please check your network connection."
          );
        } else {
          setError("Error setting up the request: " + e.message);
        }
      } else {
        setError("Error: " + e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDropdownChange = (selectedOptions) => {
    setSelectedOptions(selectedOptions.map((option) => option.value));
  };

  const renderResponse = () => {
    if (!response) return null;

    let filteredResponse = [];
    console.log(response);
    if (selectedOptions.includes("Alphabets")) {
      const alphabets =
        response.alphabets.length > 0 ? response.alphabets.join(", ") : "None";
      filteredResponse.push("Alphabets: " + alphabets);
    }

    if (selectedOptions.includes("Numbers")) {
      const numbers =
        response.numbers.length > 0 ? response.numbers.join(", ") : "None";
      filteredResponse.push("Numbers: " + numbers);
    }

    if (selectedOptions.includes("Highest alphabet")) {
      const highestAlphabet =
        response.highest_lowercase_alphabet.length > 0
          ? response.highest_lowercase_alphabet[0]
          : "None";
      filteredResponse.push("Highest lowercase alphabet: " + highestAlphabet);
    }

    if (selectedOptions.includes("File details")) {
      filteredResponse.push(
        `File valid: ${response.file_valid ? "True" : "False"}`
      );
      filteredResponse.push(
        `MIME type: ${response.file_mime_type || "Unknown"}`
      );
      filteredResponse.push(
        `File size: ${
          response.file_size_kb ? response.file_size_kb + " KB" : "Unknown"
        }`
      );
    }

    return (
      <ul>
        {filteredResponse.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const options = [
    { value: "Alphabets", label: "Alphabets" },
    { value: "Numbers", label: "Numbers" },
    { value: "Highest alphabet", label: "Highest lowercase alphabet" },
    { value: "File details", label: "File details" },
  ];

  return (
    <div
      style={{
        textAlign: "center",
        maxWidth: "600px",
        margin: "0 auto",
        marginTop: "10%",
        padding: "20px",
        backgroundColor: "#f0f0f0",
        borderRadius: "10px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1>JSON Input Form</h1>
      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder='Enter JSON here (e.g., {"data": ["A","C","z"]})'
        style={{
          width: "100%",
          minHeight: "100px",
          marginBottom: "15px",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          fontFamily: "inherit",
          fontSize: "16px",
        }}
      />
      <input
        type="file"
        onChange={handleFileChange}
        style={{
          display: "block",
          margin: "15px 0",
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          backgroundColor: isLoading ? "grey" : "blue",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Submit"}
      </button>
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      {response && (
        <>
          <Select
            isMulti
            options={options}
            onChange={handleDropdownChange}
            className="mt-3"
            placeholder="Select fields to display"
            styles={{
              container: (base) => ({
                ...base,
                marginTop: "20px",
              }),
            }}
          />
          <div style={{ marginTop: "20px" }}>{renderResponse()}</div>
        </>
      )}
    </div>
  );
}

export default App;
