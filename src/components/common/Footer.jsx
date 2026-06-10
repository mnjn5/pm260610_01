export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-100 px-5 py-10 text-sm text-gray-700">
      <div className="mx-auto max-w-[1200px]">
        <p className="font-bold text-gray-900">mycompany</p>
        <p className="mt-2 text-gray-700">
          (주)마이컴퍼니 · 대표 홍길동 · 사업자등록번호 000-00-00000
        </p>
        <p className="text-gray-700">고객센터 1234-5678 · webmaster@mycompany.com</p>
        <p className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} mycompany. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
