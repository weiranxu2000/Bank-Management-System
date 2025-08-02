package com.alien.bank.management.system.utils;

import com.alien.bank.management.system.repository.AccountRepository;
import lombok.RequiredArgsConstructor;

import java.util.Random;

@RequiredArgsConstructor
public class Utils {

    private static final Random RANDOM = new Random();

    public static String generateCardNumber() {
        // 中国银行卡号规则：19位数字
        // 前6位为BIN码（银行标识码），使用622202（中国工商银行标识）
        StringBuilder cardNumber = new StringBuilder("622202");
        
        // 中间12位为账户标识码
        for (int i = 0; i < 12; i++) {
            cardNumber.append(RANDOM.nextInt(10));
        }
        
        // 最后1位为校验码（简化处理，随机生成）
        cardNumber.append(RANDOM.nextInt(10));
        
        return cardNumber.toString();
    }

    public static String generate6DigitPassword() {
        return generateRandomNumber(6);
    }

    public static String generateCVV() {
        return generateRandomNumber(3);
    }

    private static String generateRandomNumber(int len) {
        StringBuilder number = new StringBuilder();

        for (int i = 0; i < len; ++i) {
            int digit = RANDOM.nextInt(10);
            number.append(digit);
        }

        return number.toString();
    }
}
