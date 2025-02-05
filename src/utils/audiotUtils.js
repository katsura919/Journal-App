import { Audio } from "expo-av";
import { Alert } from "react-native";
const ASSEMBLYAI_API_KEY = "5c55703d192c453e947d414e39a8248a"; // Replace with your actual API key
export const startRecording = async (setRecording) => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "You need to grant microphone access.");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await newRecording.startAsync();
    setRecording(newRecording);
  } catch (error) {
    console.error("Error starting recording:", error);
  }
};

export const stopRecording = async (recording, setTranscription, setIsUploading) => {
  if (!recording) return;
  setIsUploading(true);

  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log("Recorded file:", uri);
    await uploadAudio(uri, setTranscription, setIsUploading);
  } catch (error) {
    console.error("Error stopping recording:", error);
  }
};

export const uploadAudio = async (audioUri, setTranscription, setIsUploading) => {
  const ASSEMBLYAI_API_KEY = "5c55703d192c453e947d414e39a8248a"; // Replace with your actual API key

  try {
    const audioData = await fetch(audioUri);
    const audioBlob = await audioData.blob();

    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: { "Authorization": ASSEMBLYAI_API_KEY },
      body: audioBlob,
    });

    const uploadResult = await uploadResponse.json();
    const audioUrl = uploadResult.upload_url;
    console.log("Uploaded audio URL:", audioUrl);

    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        "Authorization": ASSEMBLYAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio_url: audioUrl }),
    });

    const transcriptResult = await transcriptResponse.json();
    const transcriptId = transcriptResult.id;
    console.log("Transcription ID:", transcriptId);

    checkTranscriptionStatus(transcriptId, setTranscription, setIsUploading);
  } catch (error) {
    console.error("Error uploading audio:", error);
  }
};

export const checkTranscriptionStatus = async (transcriptId, setTranscription, setIsUploading) => {
  try {
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      method: "GET",
      headers: { "Authorization": ASSEMBLYAI_API_KEY },
    });

    const result = await response.json();
    console.log("Transcription status:", result);

    if (result.status === "completed") {
      setTranscription(result.text);
      setIsUploading(false);
    } else if (result.status === "failed") {
      setTranscription("Transcription failed. Try again.");
      setIsUploading(false);
    } else {
      setTimeout(() => checkTranscriptionStatus(transcriptId, setTranscription, setIsUploading), 3000);
    }
  } catch (error) {
    console.error("Error checking transcription status:", error);
  }
};
