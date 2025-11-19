// Prisma 概览介绍 - 主要交互功能

document.addEventListener('DOMContentLoaded', function() {
    // 导航栏平滑滚动
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 章节导航高亮
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('nav a[href^="#"]');
    
    function highlightNav() {
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (window.pageYOffset >= sectionTop - 100 && 
                window.pageYOffset < sectionTop + sectionHeight - 100) {
                currentSection = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('text-blue-600', 'font-semibold');
            if (item.getAttribute('href') === `#${currentSection}`) {
                item.classList.add('text-blue-600', 'font-semibold');
            }
        });
    }

    window.addEventListener('scroll', highlightNav);
    highlightNav();

    // 代码复制功能
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const button = document.createElement('button');
        button.className = 'absolute top-2 right-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity';
        button.innerHTML = '<i class="fas fa-copy mr-1"></i>复制';
        button.addEventListener('click', () => {
            navigator.clipboard.writeText(block.textContent);
            button.innerHTML = '<i class="fas fa-check mr-1"></i>已复制';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy mr-1"></i>复制';
            }, 2000);
        });
        block.parentElement.classList.add('group', 'relative');
        block.parentElement.appendChild(button);
    });

    // 移动端菜单切换
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 图片懒加载
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    console.log('Prisma 概览介绍页面初始化完成');
});