/**
 * LeetCode 167. 两数之和 II - 输入有序数组
 * 难度：简单
 * 
 * 给你一个下标从 1 开始的整数数组 numbers，该数组已按非递减顺序排列
 * 请你从数组中找出满足相加之和等于目标数 target 的两个数
 * 
 * 示例：
 * 输入：numbers = [2,7,11,15], target = 9
 * 输出：[1,2]
 * 解释：2 与 7 之和等于目标数 9，因此 index1 = 1, index2 = 2
 */

function twoSum(numbers, target) {
  // 在这里实现你的代码
  // 提示：使用左右双指针，根据和的大小移动指针
  let left = 0;
  let right = numbers.length - 1;
  while(left < right) {
    const sum = numbers[left] + numbers[right];
    if(sum === target) {
      return [left + 1, right + 1]
    }else if(sum < target) {
      left++
    }else {
      right--
    }
  }
  return []
}

// 测试用例
console.log(twoSum([2, 7, 11, 15], 9)); // [1, 2]
console.log(twoSum([2, 3, 4], 6)); // [1, 3]
console.log(twoSum([-1, 0], -1)); // [1, 2]
