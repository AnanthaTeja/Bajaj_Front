"use client";
import { useState } from "react";
import Select from "react-select";

function App() {
  const [jsonInput, setJsonInput] = useState(
    '{"data": ["2", "A", "5", "A"],\n "file_b64":"data:application/pdf;base64,JVBERi0xLjQKJcKlwrHDqwoKMSAwIG9iaiA8PC9UeXBlIC9DYXRhbG9n"}'
  );
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleSubmit = async () => {
    try {
      const parsedInput = JSON.parse(jsonInput);
      if (!parsedInput.data || !Array.isArray(parsedInput.data)) {
        throw new Error("Invalid input format");
      }
      setError("");

      const apiResponse = await fetch(
        "https://bajaj-bfhs-end.onrender.com/bfhl",
        {
          method: "POST",
          body: JSON.stringify(parsedInput),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(
          `HTTP error! status: ${apiResponse.status}, message: ${errorText}`
        );
      }

      const data = await apiResponse.json();
      console.log("API Response:", data);
      setResponse(data);
    } catch (error) {
      setError("Error: " + error.message);
      console.error(error);
    }
  };

  const handleDropdownChange = (selectedOptions) => {
    if (selectedOptions) {
      setSelectedOptions(selectedOptions.map((option) => option.value));
    }
  };

  const renderResponse = () => {
    if (!response) return null;

    let filteredResponse = [];

    if (typeof response === "object" && response !== null) {
      if (selectedOptions.includes("Alphabets") && response.alphabets) {
        filteredResponse.push("Alphabets: " + response.alphabets.join(", "));
      }
      if (selectedOptions.includes("Numbers") && response.numbers) {
        filteredResponse.push("Numbers: " + response.numbers.join(", "));
      }
      if (
        selectedOptions.includes("Highest lowercase alphabet") &&
        response.highest_lowercase_alphabet
      ) {
        filteredResponse.push(
          "Highest lowercase alphabet: " +
            response.highest_lowercase_alphabet.join(", ")
        );
      }
      if (selectedOptions.includes("File info")) {
        if (response.file_valid) {
          filteredResponse.push("File uploaded: True");
          filteredResponse.push(`File MIME type: ${response.file_mime_type}`);
          filteredResponse.push(`File size: ${response.file_size_kb} KB`);
        } else {
          filteredResponse.push("No file uploaded or invalid file");
        }
      }
    }

    return (
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        {filteredResponse.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const options = [
    { value: "Alphabets", label: "Alphabets" },
    { value: "Numbers", label: "Numbers" },
    {
      value: "Highest lowercase alphabet",
      label: "Highest lowercase alphabet",
    },
    { value: "File info", label: "File info" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          JSON Input Form
        </h1>

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='Enter JSON here (e.g., {"data": ["A","C","z"]})'
          className="w-full min-h-[120px] mb-4 p-4 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>

        {error && <div className="text-red-600 mt-4">{error}</div>}

        {response && (
          <>
            <div className="mt-6">
              <Select
                isMulti
                options={options}
                onChange={handleDropdownChange}
                className="text-gray-800"
              />
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Filtered Response</h2>
              {renderResponse()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
