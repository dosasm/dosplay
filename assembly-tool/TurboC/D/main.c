#include <stdio.h>
#include <conio.h>

int main() {
    int ch;
    printf("Press a special key (e.g., arrow keys, function keys).\n");
    ch = getch();
    if (ch == 0 || ch == 224) {
        ch = getch();
        switch (ch) {
            case 72:
                printf("You pressed the Up arrow key.\n");
                break;
            case 80:
                printf("You pressed the Down arrow key.\n");
                break;
            case 75:
                printf("You pressed the Left arrow key.\n");
                break;
            case 77:
                printf("You pressed the Right arrow key.\n");
                break;
            default:
                printf("You pressed an unknown special key.\n");
        }
    } else {
        printf("You pressed a normal key: %c\n", ch);
    }
    return 0;
}