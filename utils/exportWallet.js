export const exportWallet = () => {
  let keystore = localStorage.getItem("keystore");
  let textToSaveAsBlob = new Blob([keystore], { type: "text/plain" });
  let textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
  let fileNameToSaveAs = "exportedJsonKeystore.json";

  let downloadLink = document.createElement("a");
  downloadLink.download = fileNameToSaveAs;
  downloadLink.innerHTML = "Download File";
  downloadLink.href = textToSaveAsURL;
  downloadLink.onclick = destroyClickedElement;
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);

  downloadLink.click();
};

function destroyClickedElement(event) {
  document.body.removeChild(event.target);
}
