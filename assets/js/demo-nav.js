function toggleDropdownPin(dropdownId) {
    const targetDropdown = document.getElementById(dropdownId);
    if (!targetDropdown) return;

    const targetContent = targetDropdown.querySelector('.dropdown-content');
    if (!targetContent) return;

    const shouldPin = !targetContent.classList.contains('pinned');
    document.querySelectorAll('.dropdown-content.pinned').forEach((content) => {
        content.classList.remove('pinned');
    });

    if (shouldPin) {
        targetContent.classList.add('pinned');
    }
}

window.toggleDropdownPin = toggleDropdownPin;

document.addEventListener('click', (event) => {
    if (event.target.closest('.nav-item.dropdown')) return;
    document.querySelectorAll('.dropdown-content.pinned').forEach((content) => {
        content.classList.remove('pinned');
    });
});
