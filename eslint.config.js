import antfu from '@antfu/eslint-config'

// https://github.com/antfu/eslint-config
export default antfu(
  {
    vue: true,
    typescript: true,
    ignores: ['README.md', 'src/types/shims-vue.d.ts', 'src/components/base/CaDetail/README.md']
  },
  {
    // Remember to specify the file glob here, otherwise it might cause the vue plugin to handle non-vue files
    files: ['**/*.vue'],
    rules: {
      'vue/block-order': [
        2,
        {
          order: [['script', 'template'], 'style']
        }
      ], // 强制组件顶级元素的顺序
      'vue/html-self-closing': [
        0,
        {
          html: {
            void: 'never',
            normal: 'always',
            component: 'never'
          }
        }
      ], // 强制自结束样式
      'vue/custom-event-name-casing': 0, // 对自定义事件名称强制使用特定大小写
      'vue/singleline-html-element-content-newline': 0, // 要求在单行元素的内容前后换行
      'vue/first-attribute-linebreak': 0, // 强制第一个属性的位置
      'vue/define-macros-order': 0, // 强制执行定义宏的顺序
      'vue/html-indent': 0, // 在《模板》中强制一致的缩进
      'vue/html-closing-bracket-newline': 0, // 要求或不允许在标记的右括号前换行
      'vue/no-required-prop-with-default': 0, // 必需 prop 应设为可选
      'vue/require-explicit-emits': 0, // 事件需要在 defineEmits 中声明
      'vue/attributes-order': 0 // 属性顺序
    }
  },
  {
    // Without `files`, they are general rules for all files
    rules: {
      'curly': [0, 'all'], // 对所有控制语句强制使用一致的大括号样式
      'dot-notation': 0, // 尽可能强制使用点表示法
      'no-new': 0, // 不允许在赋值或比较之外使用 new 运算符
      'no-console': 0, // 禁止使用 console
      'no-process-env': 0,
      'style/arrow-parens': [2, 'always'], // 箭头函数参数需要括号
      'style/comma-dangle': [2, 'never'], // 要求或不允许尾随逗号
      'ts/consistent-type-definitions': 0,
      'ts/no-unused-expressions': 0,
      'ts/no-use-before-define': 0, // 函数在定义前使用
      'node/prefer-global/process': 0,
      'antfu/top-level-function': 0,
      'antfu/if-newline': 0,
      'tailwindcss/no-custom-classname': 'off',
      'unused-imports/no-unused-vars': 0, // 未使用的变量
      'style/indent': 0, // 缩进问题
      'prefer-template': 0, // 字符串拼接
      'style/operator-linebreak': 0, // 运算符换行
      'prefer-const': 0, // 使用 const
      'unicorn/prefer-number-properties': 0, // Number.parseInt
      'unicorn/prefer-dom-node-text-content': 0, // textContent
      'regexp/no-unused-capturing-group': 0, // 未使用的捕获组
      'vue/no-template-shadow': 0, // 模板变量遮蔽
      'vue/no-unused-refs': 0, // 未使用的 ref
      'vue/no-parsing-error': 0, // 解析错误
      'jsdoc/check-param-names': 0, // JSDoc 参数检查
      'no-useless-return': 0, // 无用的 return
      'unused-imports/no-unused-imports': 0, // 未使用的导入
      'style/brace-style': 0 // 大括号样式
    }
  }
)
