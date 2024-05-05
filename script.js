const namesTextarea = document.getElementById('names');
const seedInput = document.getElementById('seed'); // Seed input
const presetListSelect = document.getElementById('presetList'); // Preset list selector
const rollCallButton = document.getElementById('rollCallButton');
const resultDiv = document.getElementById('result');
const delimiterSelect = document.getElementById('delimiter');

// Simple PRNG (Linear Congruential Generator)
function LCG(seed) {
    this.a = 1664525;
    this.c = 1013904223;
    this.m = Math.pow(2, 32);
    this.seed = seed % this.m;
    this.next = function () {
        this.seed = (this.a * this.seed + this.c) % this.m;
        return this.seed / this.m;
    };
}

function addToHistory(name, timestamp) {
    const historyList = document.getElementById('historyList');
    const listItem = document.createElement('li');
    listItem.textContent = `${name} - ${timestamp}`;
    listItem.classList.add('history-item'); // Adjust class to match the provided HTML
    historyList.prepend(listItem);
}

function startRollCall(namesArray, seed) {
    let currentNameIndex = 0;
    let animationFrameId;

    const duration = 3000; // Animation duration in milliseconds
    const startSpeed = 50; // Start interval in milliseconds (fast)
    const endSpeed = 1000; // End interval (slow)

    // Initialize PRNG with the provided seed
    const prng = seed ? new LCG(seed) : null;

    let currentSpeed = startSpeed;
    let speedIncrement = endSpeed / duration * startSpeed;

    const animateRollCall = () => {
        // Update name at current index
        resultDiv.textContent = namesArray[currentNameIndex % namesArray.length];
        // Schedule the next update
        animationFrameId = setTimeout(() => {
            requestAnimationFrame(animateRollCall);
            // Increment the index
            currentNameIndex++;
            // Gradually decrease speed to create a deceleration effect
            currentSpeed = Math.min(endSpeed, currentSpeed + speedIncrement);
        }, currentSpeed);
    };

    // Start the animation
    animateRollCall();

    // Stop the animation after the specified duration
    setTimeout(() => {
        clearTimeout(animationFrameId); // Stop the scheduled updates

        let finalRandomIndex;
        if (prng) {
            // Use PRNG to pick a name if seed is provided
            finalRandomIndex = Math.floor(prng.next() * namesArray.length);
        } else {
            // Use Math.random() if no seed is provided
            finalRandomIndex = Math.floor(Math.random() * namesArray.length);
        }
        const finalName = namesArray[finalRandomIndex];

        resultDiv.textContent = finalName; // Show the final random name

        const timestamp = new Date().toLocaleString();
        addToHistory(finalName, timestamp); // Add to history
    }, duration);
}

rollCallButton.addEventListener('click', () => {
    let namesText = namesTextarea.value.trim();
    const delimiter = delimiterSelect.value;
    // Read the seed value, if provided
    const seedValue = seedInput.value ? parseInt(seedInput.value, 10) : null;

    // Check if a preset list is selected and update the namesText accordingly
    const selectedPresetList = presetListSelect.value;
    if (selectedPresetList) {
        namesText = selectedPresetList;
    }
    const namesArray = namesText.split(delimiter).filter(name => name.trim() !== '').map(name => name.trim());

    if (namesArray.length > 0) {
        startRollCall([...new Set(namesArray)], seedValue);
    } else {
        resultDiv.textContent = "请输入名字或选择一个预设名单。";
    }
});

// Add an event listener to the preset list selector
presetListSelect.addEventListener('change', () => {
    if (presetListSelect.value) {
        namesTextarea.value = presetListSelect.value; // Set the textarea content to the selected preset list
    }
});