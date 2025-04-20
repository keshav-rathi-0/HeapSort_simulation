// DOM Elements
const inputMethodSelect = document.getElementById('input-method');
const manualInputSection = document.getElementById('manual-input-section');
const randomInputSection = document.getElementById('random-input-section');
const arrayInput = document.getElementById('array-input');
const arraySizeInput = document.getElementById('array-size');
const minValueInput = document.getElementById('min-value');
const maxValueInput = document.getElementById('max-value');
const heapTypeSelect = document.getElementById('heap-type');
const animationSpeedInput = document.getElementById('animation-speed');
const speedValueDisplay = document.getElementById('speed-value');
const generateBtn = document.getElementById('generate-btn');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const arrayContainer = document.getElementById('array-container');
const binaryTree = document.getElementById('binary-tree');
const stepDescription = document.getElementById('step-description');
const statusIndicator = document.getElementById('status-indicator');
const arrayInputError = document.getElementById('array-input-error');
const arraySizeError = document.getElementById('array-size-error');
const maxValueError = document.getElementById('max-value-error');
const completionModal = document.getElementById('completion-modal');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Variables
let array = [];
let steps = [];
let currentStepIndex = -1;
let animationSpeed = 1000;
let animationInterval;
let isPlaying = false;

// Event Listeners
inputMethodSelect.addEventListener('change', toggleInputMethod);
animationSpeedInput.addEventListener('input', updateAnimationSpeed);
generateBtn.addEventListener('click', generateHeap);
startBtn.addEventListener('click', startSorting);
resetBtn.addEventListener('click', resetVisualization);
prevBtn.addEventListener('click', showPreviousStep);
nextBtn.addEventListener('click', showNextStep);
playBtn.addEventListener('click', playAnimation);
pauseBtn.addEventListener('click', pauseAnimation);
arrayInput.addEventListener('input', validateManualInput);
arraySizeInput.addEventListener('input', validateRandomInput);
minValueInput.addEventListener('input', validateRandomInput);
maxValueInput.addEventListener('input', validateRandomInput);

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    });
});

// Functions
function showSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
    
    // Reset visualization when switching sections
    if (sectionId === 'simulation-section') {
        resetVisualization();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function toggleInputMethod() {
    if (inputMethodSelect.value === 'manual') {
        manualInputSection.style.display = 'block';
        randomInputSection.style.display = 'none';
        validateManualInput();
    } else {
        manualInputSection.style.display = 'none';
        randomInputSection.style.display = 'block';
        validateRandomInput();
    }
}

function validateManualInput() {
    const input = arrayInput.value.trim();
    const numbers = input.split(',').filter(item => item.trim() !== '').map(item => parseInt(item.trim()));
    
    if (input === '' || numbers.length < 2 || numbers.some(isNaN)) {
        arrayInputError.style.display = 'block';
        generateBtn.disabled = true;
        return false;
    } else {
        arrayInputError.style.display = 'none';
        generateBtn.disabled = false;
        return true;
    }
}

function validateRandomInput() {
    const size = parseInt(arraySizeInput.value);
    const min = parseInt(minValueInput.value);
    const max = parseInt(maxValueInput.value);
    
    let isValid = true;
    
    if (isNaN(size) || size < 3 || size > 15) {
        arraySizeError.style.display = 'block';
        isValid = false;
    } else {
        arraySizeError.style.display = 'none';
    }
    
    if (isNaN(min) || isNaN(max) || min >= max) {
        maxValueError.style.display = 'block';
        isValid = false;
    } else {
        maxValueError.style.display = 'none';
    }
    
    generateBtn.disabled = !isValid;
    return isValid;
}

function updateAnimationSpeed() {
    // Reverse the speed calculation so higher values = slower speed
    animationSpeed = 2100 - parseInt(animationSpeedInput.value);
    speedValueDisplay.textContent = `${2100 - animationSpeed}ms`;
    
    if (isPlaying) {
        pauseAnimation();
        playAnimation();
    }
}

function generateRandomArray(size, min, max) {
    const arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return arr;
}

function parseInputArray() {
    const input = arrayInput.value.trim();
    if (!input) return [];
    
    return input.split(',').map(item => {
        const num = parseInt(item.trim());
        return isNaN(num) ? 0 : num;
    });
}

function generateHeap() {
    // Get array based on input method
    if (inputMethodSelect.value === 'manual') {
        if (!validateManualInput()) return;
        array = parseInputArray();
    } else {
        if (!validateRandomInput()) return;
        const size = parseInt(arraySizeInput.value);
        const min = parseInt(minValueInput.value);
        const max = parseInt(maxValueInput.value);
        array = generateRandomArray(size, min, max);
        arrayInput.value = array.join(', ');
    }

    // Reset any previous visualization
    resetVisualization(false);
    
    // Display initial array
    displayArray(array);
    
    // Display initial heap structure
    displayHeapStructure(array);

    updateStatus('Ready to begin sorting', 'status-ready');
    startBtn.disabled = false;
}

function startSorting() {
    // Disable input controls
    inputMethodSelect.disabled = true;
    arrayInput.disabled = true;
    arraySizeInput.disabled = true;
    minValueInput.disabled = true;
    maxValueInput.disabled = true;
    heapTypeSelect.disabled = true;
    generateBtn.disabled = true;
    startBtn.disabled = true;
    
    // Enable navigation controls
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // Generate steps for the heap sort algorithm
    const isMaxHeap = heapTypeSelect.value === 'max';
    steps = generateHeapSortSteps([...array], isMaxHeap);
    
    // Start from the first step
    currentStepIndex = -1;
    showNextStep();
}

function resetVisualization(resetArray = true) {
    // Clear any ongoing animation
    pauseAnimation();
    
    // Reset step index
    currentStepIndex = -1;
    
    // Clear steps
    steps = [];
    
    // Reset array if needed
    if (resetArray) {
        array = [];
        arrayInput.value = '';
    }
    
    // Clear visualizations
    arrayContainer.innerHTML = '';
    binaryTree.innerHTML = '';
    
    // Reset status
    updateStatus('Ready to begin visualization', 'status-idle');
    
    // Reset controls
    inputMethodSelect.disabled = false;
    arrayInput.disabled = false;
    arraySizeInput.disabled = false;
    minValueInput.disabled = false;
    maxValueInput.disabled = false;
    heapTypeSelect.disabled = false;
    generateBtn.disabled = false;
    startBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    playBtn.disabled = true;
    pauseBtn.disabled = true;
}

function showPreviousStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        displayStep(steps[currentStepIndex]);
        
        // Update navigation buttons
        nextBtn.disabled = false;
        pauseBtn.disabled = true;
        playBtn.disabled = false;
        prevBtn.disabled = currentStepIndex === 0;
    }
}

function showNextStep() {
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        displayStep(steps[currentStepIndex]);
        
        // Update navigation buttons
        prevBtn.disabled = false;
        pauseBtn.disabled = !isPlaying;
        playBtn.disabled = isPlaying || currentStepIndex === steps.length - 1;
        nextBtn.disabled = currentStepIndex === steps.length - 1 || isPlaying;
        
        if (currentStepIndex === steps.length - 1) {
            updateStatus('Sorting completed!', 'status-complete');
            pauseAnimation();
            showCompletionModal();
        }
    }
}

function playAnimation() {
    if (isPlaying) return;
    
    isPlaying = true;
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    
    // If we're at the end, start from the beginning
    if (currentStepIndex >= steps.length - 1) {
        currentStepIndex = -1;
    }
    
    animationInterval = setInterval(() => {
        if (currentStepIndex < steps.length - 1) {
            showNextStep();
        } else {
            pauseAnimation();
        }
    }, animationSpeed);
}

function pauseAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    
    isPlaying = false;
    pauseBtn.disabled = true;
    playBtn.disabled = currentStepIndex >= steps.length - 1;
    prevBtn.disabled = currentStepIndex <= 0;
    nextBtn.disabled = currentStepIndex >= steps.length - 1;
}

function updateStatus(text, statusClass) {
    stepDescription.textContent = text;
    statusIndicator.className = 'status-indicator ' + statusClass;
}

function displayArray(arr, highlights = [], sorted = [], swapping = [], rootIndex = -1) {
    arrayContainer.innerHTML = '';
    
    arr.forEach((value, index) => {
        const element = document.createElement('div');
        element.className = 'array-element';
        element.textContent = value;
        element.setAttribute('data-index', index);
        
        if (highlights.includes(index)) {
            element.classList.add('highlight');
        }
        
        if (sorted.includes(index)) {
            element.classList.add('sorted');
        }
        
        if (swapping.includes(index)) {
            element.classList.add('swapping');
        }
        
        if (index === rootIndex) {
            element.classList.add('root');
        }
        
        arrayContainer.appendChild(element);
    });
}

function displayHeapStructure(arr, highlights = [], sorted = [], swapping = [], rootIndex = 0) {
    binaryTree.innerHTML = '';

    // Set dimensions
    const treeHeight = Math.ceil(Math.log2(arr.length + 1));
    const maxNodes = Math.pow(2, treeHeight) - 1;
    const nodeSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--node-size'));
    const levelHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--level-height'));
    
    // Calculate tree width based on maximum possible nodes at the bottom level
    const bottomLevelNodes = Math.pow(2, treeHeight - 1);
    const treeWidth = bottomLevelNodes * (nodeSize * 2.5);
    
    binaryTree.style.width = `${treeWidth}px`;
    binaryTree.style.height = `${treeHeight * parseInt(levelHeight) + nodeSize}px`;
    
    // Create nodes and edges
    for (let i = 0; i < arr.length; i++) {
        const level = Math.floor(Math.log2(i + 1));
        const nodesInLevel = Math.pow(2, level);
        const nodeIndex = (i + 1) - Math.pow(2, level);
        
        // Calculate position
        const horizontalSpacing = treeWidth / (nodesInLevel + 1);
        const x = (nodeIndex + 1) * horizontalSpacing - (nodeSize / 2);
        const y = level * parseInt(levelHeight);
        
        // Create node
        const node = document.createElement('div');
        node.className = 'node';
        if (highlights.includes(i)) {
            node.classList.add('highlight');
        }
        if (sorted.includes(i)) {
            node.classList.add('sorted');
        }
        if (swapping.includes(i)) {
            node.classList.add('swapping');
        }
        if (i === rootIndex) {
            node.classList.add('root');
        }
        node.textContent = arr[i];
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        binaryTree.appendChild(node);
        
        // Create edge to parent
        if (i > 0) {
            const parentIndex = Math.floor((i - 1) / 2);
            const parentLevel = Math.floor(Math.log2(parentIndex + 1));
            const nodesInParentLevel = Math.pow(2, parentLevel);
            const parentNodeIndex = (parentIndex + 1) - Math.pow(2, parentLevel);
            
            const parentX = (parentNodeIndex + 1) * (treeWidth / (nodesInParentLevel + 1)) - (nodeSize / 2) + (nodeSize / 2);
            const parentY = parentLevel * parseInt(levelHeight) + (nodeSize / 2);
            
            const childX = x + (nodeSize / 2);
            const childY = y + (nodeSize / 2);
            
            const edge = document.createElement('div');
            edge.className = 'edge';
            if ((highlights.includes(i) && highlights.includes(parentIndex)) || 
                (highlights.length === 1 && highlights[0] === parentIndex)) {
                edge.classList.add('highlight');
            }
            
            // Calculate length and angle
            const deltaX = childX - parentX;
            const deltaY = childY - parentY;
            const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            
            edge.style.width = `${length}px`;
            edge.style.left = `${parentX}px`;
            edge.style.top = `${parentY}px`;
            edge.style.transform = `rotate(${angle}deg)`;
            
            binaryTree.appendChild(edge);
        }
    }
}

function generateHeapSortSteps(arr, isMaxHeap) {
    const steps = [];
    const n = arr.length;
    const sortedIndices = [];
    
    // Add initial step
    steps.push({
        array: [...arr],
        description: 'Initial array before heapification',
        highlights: [],
        sorted: [],
        swapping: [],
        rootIndex: -1
    });
    
    // Function to add a step
    function addStep(description, highlights = [], sorted = [], swapping = [], rootIndex = -1) {
        steps.push({
            array: [...arr],
            description,
            highlights,
            sorted: [...sorted],
            swapping,
            rootIndex
        });
    }
    
    // Heapify function
    function heapify(n, i) {
        let extreme = i; // largest for max heap, smallest for min heap
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        // Compare with left child
        if (left < n) {
            const comparison = isMaxHeap ? arr[left] > arr[extreme] : arr[left] < arr[extreme];
            addStep(`Comparing parent at index ${i} (value ${arr[i]}) with left child at index ${left} (value ${arr[left]})`, 
                    [i, left], sortedIndices, [], i);
            
            if (comparison) {
                extreme = left;
                addStep(`Left child ${arr[left]} is ${isMaxHeap ? 'larger' : 'smaller'} than parent ${arr[i]}. Setting ${isMaxHeap ? 'largest' : 'smallest'} to left child.`, 
                        [extreme], sortedIndices, [], i);
            }
        }
        
        // Compare with right child
        if (right < n) {
            const comparison = isMaxHeap ? arr[right] > arr[extreme] : arr[right] < arr[extreme];
            addStep(`Comparing ${extreme === i ? 'parent' : 'left child'} (value ${arr[extreme]}) with right child at index ${right} (value ${arr[right]})`, 
                    [extreme, right], sortedIndices, [], i);
            
            if (comparison) {
                extreme = right;
                addStep(`Right child ${arr[right]} is ${isMaxHeap ? 'larger' : 'smaller'} than current ${isMaxHeap ? 'largest' : 'smallest'} ${arr[extreme === i ? i : left]}. Setting ${isMaxHeap ? 'largest' : 'smallest'} to right child.`, 
                        [extreme], sortedIndices, [], i);
            }
        }
        
        // Swap if needed
        if (extreme !== i) {
            addStep(`Swapping ${arr[i]} with ${arr[extreme]}`, [i, extreme], sortedIndices, [i, extreme], i);
            [arr[i], arr[extreme]] = [arr[extreme], arr[i]];
            addStep(`After swap: ${arr[i]} is now at index ${i} and ${arr[extreme]} is at index ${extreme}`, [i, extreme], sortedIndices, [], i);
            
            // Recursively heapify the affected sub-tree
            heapify(n, extreme);
        } else {
            addStep(`Heap property satisfied at index ${i}`, [i], sortedIndices, [], i);
        }
    }
    
    // Build heap (rearrange array)
    addStep('Starting to build the heap', [], sortedIndices, [], -1);
    updateStatus('Building heap...', 'status-building');
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        addStep(`Heapifying subtree rooted at index ${i} (value ${arr[i]})`, [i], sortedIndices, [], i);
        heapify(n, i);
    }
    
    addStep(`${isMaxHeap ? 'Max' : 'Min'} heap has been built successfully`, [], sortedIndices, [], 0);
    updateStatus('Heap built. Starting sorting...', 'status-sorting');
    
    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
        // Move current root to end
        addStep(`Moving root element ${arr[0]} to index ${i} (sorted position)`, [0, i], sortedIndices, [0, i], 0);
        [arr[0], arr[i]] = [arr[i], arr[0]];
        
        // Mark the element as sorted
        sortedIndices.push(i);
        addStep(`Placed ${arr[i]} in its correct sorted position`, [], [...sortedIndices], [], 0);
        
        // Call heapify on the reduced heap
        addStep(`Heapifying the reduced heap (size ${i})`, [0], [...sortedIndices], [], 0);
        heapify(i, 0);
    }
    
    // Mark the first element as sorted as well
    sortedIndices.push(0);
    addStep('Sorting completed!', [], [...sortedIndices], [], -1);
    
    return steps;
}

function displayStep(step) {
    displayArray(step.array, step.highlights, step.sorted, step.swapping, step.rootIndex);
    displayHeapStructure(step.array, step.highlights, step.sorted, step.swapping, step.rootIndex);
    stepDescription.textContent = step.description;
    
    // Update status based on step
    if (step.description.includes('building')) {
        updateStatus(step.description, 'status-building');
    } else if (step.description.includes('sorting')) {
        updateStatus(step.description, 'status-sorting');
    } else if (step.description.includes('completed')) {
        updateStatus(step.description, 'status-complete');
    }
}

function showCompletionModal() {
    completionModal.style.display = 'flex';
}

function hideCompletionModal() {
    completionModal.style.display = 'none';
}

function showTheoryAfterCompletion() {
    hideCompletionModal();
    showSection('theory-section');
}

// Initialize
toggleInputMethod();
updateAnimationSpeed();
validateManualInput();

// Add default array for user convenience
arrayInput.value = '12, 5, 3, 8, 7, 10, 6';