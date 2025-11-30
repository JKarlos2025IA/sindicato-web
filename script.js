document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('birthday-banner');
    const birthdayNamesSpan = document.getElementById('birthday-names');
    const today = new Date();
    // Format today as MM-DD
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${month}-${day}`;

    console.log("Fecha actual:", todayString);

    const birthdaySocios = socios.filter(socio => socio.fecha === todayString);

    if (birthdaySocios.length > 0) {
        const names = birthdaySocios.map(s => s.nombre).join(', ');
        birthdayNamesSpan.textContent = names;
        banner.classList.remove('hidden');

        // Simulación de envío de correo
        birthdaySocios.forEach(socio => {
            console.log(`Enviando correo a: ${socio.email}`);
        });
    }
});
